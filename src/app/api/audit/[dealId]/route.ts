import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      OR: [{ createdById: userId }, { parties: { some: { userId } } }],
    },
    select: { id: true },
  })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const logs = await prisma.auditLog.findMany({
    where: { dealId },
    orderBy: { createdAt: 'asc' },
  })

  const data = logs.map((l) => ({
    id: l.id,
    deal_id: l.dealId,
    action: l.action,
    actor_id: l.actorId,
    actor_name: l.actorName,
    actor_phone: l.actorPhone,
    metadata: l.metadata as Record<string, unknown>,
    ip_address: l.ipAddress,
    user_agent: l.userAgent,
    created_at: l.createdAt.toISOString(),
  }))

  return NextResponse.json({ data })
}
