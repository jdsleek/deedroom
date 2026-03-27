import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { sendOtp } from "@/lib/termii"
import { logAudit } from "@/lib/audit"

const OTP_COOLDOWN_MS = 10 * 60 * 1000
const MAX_SENDS_PER_COOLDOWN = 3

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { signature_request_id, channel = "sms" } = body
    if (!signature_request_id) {
      return NextResponse.json({ error: "Missing signature_request_id" }, { status: 400 })
    }

    const sigReq = await prisma.signatureRequest.findUnique({
      where: { id: signature_request_id },
      include: {
        party: { select: { id: true, userId: true, invitePhone: true, inviteName: true, dealId: true } },
        deal: { select: { status: true } },
      },
    })
    if (!sigReq) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (sigReq.party.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const signerProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    })
    if (!signerProfile || signerProfile.kycStatus !== 'verified') {
      return NextResponse.json(
        { error: "Identity verification required. Complete KYC before signing documents." },
        { status: 403 }
      )
    }

    if (sigReq.deal.status === "completed" || sigReq.deal.status === "cancelled") {
      return NextResponse.json({ error: "Deal is not in a signable state" }, { status: 400 })
    }

    if (sigReq.signedAt) {
      return NextResponse.json({ error: "This document has already been signed" }, { status: 400 })
    }

    const phone = sigReq.party.invitePhone
    if (!phone) return NextResponse.json({ error: "Party has no phone number. Update your profile to add one." }, { status: 400 })

    const recentLogs = await prisma.auditLog.count({
      where: {
        dealId: sigReq.dealId,
        action: "otp_requested",
        actorId: userId,
        createdAt: { gte: new Date(Date.now() - OTP_COOLDOWN_MS) },
      },
    })
    if (recentLogs >= MAX_SENDS_PER_COOLDOWN) {
      return NextResponse.json({ error: "Too many OTP requests. Try again later." }, { status: 429 })
    }

    let result
    try {
      result = await sendOtp(
        phone,
        channel as "sms" | "whatsapp",
        `SignNest: Signing as ${sigReq.party.inviteName || "party"}`
      )
    } catch {
      return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 502 })
    }
    if (!result?.pinId) return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10)
    const otpExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

    await prisma.signatureRequest.update({
      where: { id: signature_request_id },
      data: { otpPinId: result.pinId, otpExpiresAt, otpAttempts: 0 },
    })

    await logAudit({
      dealId: sigReq.dealId,
      action: "otp_requested",
      actorId: userId,
      actorPhone: phone,
      metadata: { signatureRequestId: signature_request_id },
    })

    if (sigReq.deal.status === 'sent' || sigReq.deal.status === 'viewing') {
      await prisma.deal.update({ where: { id: sigReq.dealId }, data: { status: 'signing' } })
    }

    await prisma.dealParty.update({ where: { id: sigReq.partyId }, data: { status: 'signing' } })

    return NextResponse.json({ data: { expires_at: otpExpiresAt.toISOString() } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
