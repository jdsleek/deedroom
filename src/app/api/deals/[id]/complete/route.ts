import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { notifyMany } from '@/lib/notifications'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      parties: true,
      documents: true,
      signatureRequests: true,
    },
  })
  if (!deal || deal.createdById !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (deal.status === 'completed') {
    return NextResponse.json({ error: 'Deal is already completed' }, { status: 400 })
  }

  if (deal.documents.length === 0) {
    return NextResponse.json({ error: 'Cannot complete a deal with no documents' }, { status: 400 })
  }

  const unsignedParties = deal.parties.filter(
    (p) => p.status !== 'declined' && !deal.signatureRequests.some((s) => s.partyId === p.id && s.signedAt)
  )
  if (unsignedParties.length > 0) {
    const names = unsignedParties.map((p) => p.inviteName).join(', ')
    return NextResponse.json(
      { error: `All parties must sign before completing. Awaiting: ${names}` },
      { status: 400 }
    )
  }

  await prisma.deal.update({
    where: { id },
    data: { status: 'completed', completedAt: new Date() },
  })

  await logAudit({ dealId: id, action: 'deal_completed', actorId: userId })

  const partyUserIds = deal.parties
    .filter((p) => p.userId && p.userId !== userId)
    .map((p) => p.userId as string)
  const uniqueIds = [...new Set(partyUserIds)]
  if (uniqueIds.length > 0) {
    await notifyMany(
      uniqueIds.map((uid) => ({
        userId: uid,
        type: 'deal_update',
        title: 'Deal Completed',
        message: `"${deal.title}" has been marked as completed. All documents are sealed.`,
        link: `/deals/${id}`,
      }))
    )
  }

  return NextResponse.json({ data: { ok: true } })
}
