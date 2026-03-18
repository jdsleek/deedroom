import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { deal_id, reason } = body

    if (!deal_id || !reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'deal_id and reason are required' }, { status: 400 })
    }

    const deal = await prisma.deal.findUnique({
      where: { id: deal_id },
      include: { parties: true },
    })

    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

    const isCreator = deal.createdById === userId
    const isParty = deal.parties.some((p) => p.userId === userId)
    const isInvitedByEmail =
      session?.user?.email &&
      deal.parties.some(
        (p) => p.inviteEmail && p.inviteEmail.toLowerCase() === session.user!.email!.toLowerCase()
      )

    if (!isCreator && !isParty && !isInvitedByEmail) {
      return NextResponse.json({ error: 'You must be part of this deal to raise a dispute' }, { status: 403 })
    }

    const dispute = await prisma.dispute.create({
      data: {
        dealId: deal_id,
        raisedById: userId,
        reason: reason.trim(),
      },
    })

    await logAudit({
      dealId: deal_id,
      action: 'dispute_raised',
      actorId: userId,
      actorName: session?.user?.name ?? session?.user?.email ?? undefined,
      metadata: { disputeId: dispute.id },
    })

    return NextResponse.json({
      id: dispute.id,
      deal_id: dispute.dealId,
      reason: dispute.reason,
      status: dispute.status,
      created_at: dispute.createdAt.toISOString(),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orConditions: Array<object> = [
      { createdById: userId },
      { parties: { some: { userId } } },
    ]
    if (session?.user?.email) {
      orConditions.push({
        parties: {
          some: {
            inviteEmail: { equals: session.user.email, mode: 'insensitive' as const },
          },
        },
      })
    }

    const deals = await prisma.deal.findMany({
      where: { OR: orConditions },
      select: { id: true },
    })

    const dealIds = deals.map((d) => d.id)

    const disputes = await prisma.dispute.findMany({
      where: { dealId: { in: dealIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        deal: { select: { id: true, title: true } },
      },
    })

    const raisedByIds = [...new Set(disputes.map((d) => d.raisedById))]
    const profiles = await prisma.profile.findMany({
      where: { id: { in: raisedByIds } },
      select: { id: true, fullName: true, email: true },
    })
    const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))

    return NextResponse.json({
      disputes: disputes.map((d) => ({
        id: d.id,
        deal_id: d.dealId,
        deal_title: d.deal.title,
        raised_by_id: d.raisedById,
        raised_by_name: profileMap[d.raisedById]?.fullName ?? profileMap[d.raisedById]?.email ?? 'Unknown',
        reason: d.reason,
        status: d.status,
        resolution: d.resolution,
        resolved_at: d.resolvedAt?.toISOString() ?? null,
        created_at: d.createdAt.toISOString(),
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
