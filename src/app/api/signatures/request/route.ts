import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { deal_id, document_id, party_id } = body
    if (!deal_id || !document_id || !party_id) {
      return NextResponse.json(
        { error: "Missing deal_id, document_id, or party_id" },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { id: deal_id },
      select: { status: true },
    })
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 })
    if (deal.status === "completed" || deal.status === "cancelled") {
      return NextResponse.json({ error: "Deal is not in a signable state" }, { status: 400 })
    }

    const party = await prisma.dealParty.findUnique({ where: { id: party_id } })
    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 })
    }
    if (party.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (party.signOrder != null) {
      const totalDocs = await prisma.document.count({ where: { dealId: deal_id } })
      const priorParties = await prisma.dealParty.findMany({
        where: {
          dealId: deal_id,
          signOrder: { lt: party.signOrder },
          status: { not: 'declined' },
        },
      })

      for (const prior of priorParties) {
        const signedDocs = await prisma.signatureRequest.count({
          where: { dealId: deal_id, partyId: prior.id, signedAt: { not: null } },
        })
        if (signedDocs < totalDocs) {
          return NextResponse.json(
            { error: `Waiting for ${prior.inviteName} (order ${prior.signOrder}) to sign first` },
            { status: 403 }
          )
        }
      }
    }

    const existing = await prisma.signatureRequest.findUnique({
      where: { documentId_partyId: { documentId: document_id, partyId: party_id } },
    })
    if (existing) {
      return NextResponse.json({
        data: {
          id: existing.id,
          document_id: existing.documentId,
          party_id: existing.partyId,
          signed_at: existing.signedAt?.toISOString() ?? null,
        },
      })
    }

    const sigReq = await prisma.signatureRequest.create({
      data: { dealId: deal_id, documentId: document_id, partyId: party_id },
    })

    return NextResponse.json({
      data: {
        id: sigReq.id,
        document_id: sigReq.documentId,
        party_id: sigReq.partyId,
        signed_at: null,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
