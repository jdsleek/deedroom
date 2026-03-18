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
  const { user_id, required_fields } = body

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
  if (required_fields !== undefined && !isCreator) {
    return NextResponse.json({ error: 'Only deal creator can set required fields' }, { status: 403 })
  }

  const updateData: { userId?: string; requiredFields?: object } = {}
  if (user_id !== undefined) updateData.userId = user_id ?? null
  if (required_fields !== undefined) {
    const rf = required_fields as { signature?: boolean; initials?: boolean; date?: boolean }
    updateData.requiredFields = {
      signature: rf.signature ?? true,
      initials: rf.initials ?? true,
      date: rf.date ?? true,
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const updated = await prisma.dealParty.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ data: updated })
}
