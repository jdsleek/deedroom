import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')))
    const status = url.searchParams.get('status')?.trim() ?? ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          deal: { select: { id: true, title: true } },
        },
      }),
      prisma.dispute.count({ where }),
    ])

    const raisedByIds = [...new Set(disputes.map((d) => d.raisedById))]
    const profiles = await prisma.profile.findMany({
      where: { id: { in: raisedByIds } },
      select: { id: true, fullName: true, email: true },
    })
    const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))

    return NextResponse.json({
      disputes: disputes.map((d) => ({
        id: d.id,
        dealId: d.dealId,
        dealTitle: d.deal.title,
        raisedById: d.raisedById,
        raisedByName: profileMap[d.raisedById]?.fullName ?? profileMap[d.raisedById]?.email ?? 'Unknown',
        reason: d.reason,
        status: d.status,
        resolution: d.resolution,
        resolvedById: d.resolvedById,
        resolvedAt: d.resolvedAt?.toISOString() ?? null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAdmin()

    const body = await req.json()
    const { id, status, resolution } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (status !== undefined) {
      const valid = ['open', 'investigating', 'resolved', 'dismissed']
      if (!valid.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      data.status = status
    }
    if (resolution !== undefined) data.resolution = String(resolution ?? '')

    if (status === 'resolved' || status === 'dismissed') {
      data.resolvedById = userId
      data.resolvedAt = new Date()
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const existing = await prisma.dispute.findUnique({
      where: { id },
      select: { dealId: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data,
    })

    if (status === 'resolved' || status === 'dismissed') {
      await logAudit({
        dealId: existing.dealId,
        action: 'dispute_resolved',
        actorId: userId,
        metadata: {
          disputeId: id,
          status,
          resolution: resolution ?? null,
        },
      })
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      resolution: updated.resolution,
      resolvedAt: updated.resolvedAt?.toISOString() ?? null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
