import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { verifyOtp } from "@/lib/termii"
import { logAudit } from "@/lib/audit"
import { notifyMany } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { signature_request_id, otp_code, signature_data, initials_data } = body
    if (!signature_request_id || !otp_code) {
      return NextResponse.json(
        { error: "Missing signature_request_id or otp_code" },
        { status: 400 }
      )
    }

    let payloadToStore: string
    if (signature_data && typeof signature_data === "string" && signature_data.startsWith("{")) {
      payloadToStore = signature_data
    } else {
      const payload: { signature?: string; initials?: string; date?: string } = {}
      if (signature_data) payload.signature = signature_data
      if (initials_data) payload.initials = initials_data
      payload.date = new Date().toISOString().slice(0, 10)
      payloadToStore = JSON.stringify(payload)
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

    if (!payloadToStore || payloadToStore === "{}") {
      return NextResponse.json(
        { error: "Missing signature_data or initials_data" },
        { status: 400 }
      )
    }

    await prisma.signatureRequest.update({
      where: { id: signature_request_id },
      data: {
        otpVerifiedAt: new Date(),
        signatureData: payloadToStore,
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

    const deal = await prisma.deal.findUnique({
      where: { id: sigReq.dealId },
      select: { title: true, createdById: true },
    })
    const signerProfile = await prisma.profile.findUnique({ where: { id: userId }, select: { fullName: true } })

    const allParties = await prisma.dealParty.findMany({
      where: { dealId: sigReq.dealId },
      select: { status: true, userId: true, inviteName: true },
    })

    const otherUserIds = allParties
      .filter((p) => p.userId && p.userId !== userId)
      .map((p) => p.userId as string)
    if (deal?.createdById && deal.createdById !== userId) {
      otherUserIds.push(deal.createdById)
    }
    const uniqueUserIds = [...new Set(otherUserIds)]
    if (uniqueUserIds.length > 0) {
      await notifyMany(
        uniqueUserIds.map((uid) => ({
          userId: uid,
          type: 'signature',
          title: 'Document Signed',
          message: `${signerProfile?.fullName ?? 'A party'} signed documents for "${deal?.title ?? 'a deal'}"`,
          link: `/deals/${sigReq.dealId}/signatures`,
        }))
      )
    }
    const allSigned = allParties.length > 0 && allParties.every((p) => p.status === "signed")

    if (allSigned) {
      await prisma.deal.update({
        where: { id: sigReq.dealId },
        data: { status: "completed", completedAt: new Date() },
      })
      await logAudit({ dealId: sigReq.dealId, action: "deal_completed", actorId: userId })

      const allUserIds = allParties
        .filter((p) => p.userId)
        .map((p) => p.userId as string)
      if (deal?.createdById) allUserIds.push(deal.createdById)
      const uniqueCompletionUserIds = [...new Set(allUserIds)]
      await notifyMany(
        uniqueCompletionUserIds.map((uid) => ({
          userId: uid,
          type: 'deal_update',
          title: 'Deal Completed',
          message: `All parties have signed. "${deal?.title ?? 'Your deal'}" is now completed!`,
          link: `/deals/${sigReq.dealId}`,
        }))
      )
    }

    return NextResponse.json({ data: { verified: true, deal_completed: allSigned } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
