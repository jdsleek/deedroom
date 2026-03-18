import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const party = await prisma.dealParty.findUnique({ where: { id } })
  if (!party) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (party.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (party.status === 'signed') return NextResponse.json({ error: 'Already signed' }, { status: 400 })

  await prisma.dealParty.update({
    where: { id },
    data: { status: 'declined', declinedAt: new Date() },
  })

  await logAudit({
    dealId: party.dealId,
    action: 'party_declined',
    actorId: userId,
    actorName: session?.user?.name ?? session?.user?.email ?? undefined,
  })

  return NextResponse.json({ data: { ok: true } })
}
