import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const [
      totalUsers,
      totalDeals,
      dealsByStatus,
      totalDocuments,
      totalSignatures,
      pendingKyc,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.deal.count(),
      prisma.deal.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.document.count(),
      prisma.signatureRequest.count({ where: { signedAt: { not: null } } }),
      prisma.profile.count({ where: { kycStatus: 'pending' } }),
    ])

    const statusMap = Object.fromEntries(
      dealsByStatus.map((s) => [s.status, s._count.id])
    )

    const deals = await prisma.deal.findMany({
      where: { status: 'completed' },
      select: { rentAmount: true, salePrice: true, agencyFee: true, legalFee: true, cautionFee: true },
    })

    const revenue = deals.reduce((sum, d) => {
      return sum + Number(d.agencyFee ?? 0) + Number(d.legalFee ?? 0)
    }, 0)

    return NextResponse.json({
      totalUsers,
      totalDeals,
      dealsByStatus: statusMap,
      totalDocuments,
      totalSignatures,
      pendingKyc,
      revenue,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
