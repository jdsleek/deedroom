import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await prisma.deal.findUnique({
    where: { id },
    select: { createdById: true },
  })
  if (!deal || deal.createdById !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.deal.update({
    where: { id },
    data: { status: 'completed', completedAt: new Date() },
  })

  await logAudit({ dealId: id, action: 'deal_completed', actorId: userId })
  return NextResponse.json({ data: { ok: true } })
}
