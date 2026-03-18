import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')))
    const status = url.searchParams.get('status') ?? ''
    const search = url.searchParams.get('search')?.trim() ?? ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { propertyAddress: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: { select: { fullName: true, email: true } },
          parties: { select: { id: true } },
          documents: { select: { id: true } },
        },
      }),
      prisma.deal.count({ where }),
    ])

    return NextResponse.json({
      deals: deals.map((d) => ({
        id: d.id,
        title: d.title,
        dealType: d.dealType,
        status: d.status,
        propertyAddress: d.propertyAddress,
        creatorName: d.createdBy.fullName,
        creatorEmail: d.createdBy.email,
        partiesCount: d.parties.length,
        documentsCount: d.documents.length,
        createdAt: d.createdAt.toISOString(),
        completedAt: d.completedAt?.toISOString() ?? null,
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
