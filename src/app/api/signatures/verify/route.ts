import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { verifyOtp } from "@/lib/termii"
import { logAudit } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { signature_request_id, otp_code, signature_data } = body
    if (!signature_request_id || !otp_code || !signature_data) {
      return NextResponse.json(
        { error: "Missing signature_request_id, otp_code, or signature_data" },
        { status: 400 }
      )
    }

    const sigReq = await prisma.signatureRequest.findUnique({
      where: { id: signature_request_id },
      include: { party: { select: { id: true, userId: true, dealId: true } } },
    })
    if (!sigReq) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (sigReq.party.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!sigReq.otpPinId) return NextResponse.json({ error: "OTP not requested" }, { status: 400 })
    if (sigReq.otpAttempts >= 3) {
      return NextResponse.json({ error: "Max attempts exceeded. Request new OTP." }, { status: 429 })
    }

    const { verified } = await verifyOtp(sigReq.otpPinId, String(otp_code))
    if (!verified) {
      await prisma.signatureRequest.update({
        where: { id: signature_request_id },
        data: { otpAttempts: sigReq.otpAttempts + 1 },
      })
      await logAudit({
        dealId: sigReq.dealId,
        action: "otp_failed",
        actorId: userId,
        metadata: { signatureRequestId: signature_request_id },
      })
      return NextResponse.json({ data: { verified: false, deal_completed: false } })
    }

    const headers = request.headers
    const ip = headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || null
    const ua = headers.get("user-agent") || null

    await prisma.signatureRequest.update({
      where: { id: signature_request_id },
      data: {
        otpVerifiedAt: new Date(),
        signatureData: signature_data,
        signedAt: new Date(),
        ipAddress: ip,
        userAgent: ua,
      },
    })

    await prisma.dealParty.update({
      where: { id: sigReq.partyId },
      data: { status: "signed", signedAt: new Date() },
    })

    await logAudit({
      dealId: sigReq.dealId,
      action: "otp_verified",
      actorId: userId,
      metadata: { signatureRequestId: signature_request_id },
    })
    await logAudit({
      dealId: sigReq.dealId,
      action: "party_signed",
      actorId: userId,
      metadata: { partyId: sigReq.partyId },
    })

    const allParties = await prisma.dealParty.findMany({
      where: { dealId: sigReq.dealId },
      select: { status: true },
    })
    const allSigned = allParties.length > 0 && allParties.every((p) => p.status === "signed")

    if (allSigned) {
      await prisma.deal.update({
        where: { id: sigReq.dealId },
        data: { status: "completed", completedAt: new Date() },
      })
      await logAudit({ dealId: sigReq.dealId, action: "deal_completed", actorId: userId })
    }

    return NextResponse.json({ data: { verified: true, deal_completed: allSigned } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
