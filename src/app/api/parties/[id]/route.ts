import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { user_id } = body

  const party = await prisma.dealParty.findUnique({
    where: { id },
    select: { dealId: true },
  })
  if (!party) return NextResponse.json({ error: 'Party not found' }, { status: 404 })

  const deal = await prisma.deal.findUnique({
    where: { id: party.dealId },
    select: { createdById: true },
  })

  const isCreator = deal?.createdById === userId
  const isSelfLinking = user_id === userId

  if (!isCreator && !isSelfLinking) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.dealParty.update({
    where: { id },
    data: { userId: user_id ?? null },
  })

  return NextResponse.json({ data: updated })
}
