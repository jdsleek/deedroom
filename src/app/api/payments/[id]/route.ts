import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'
import { paymentToApi } from '@/lib/serialize'

const UpdatePaymentSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  paidAt: z.string().optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { deal: { include: { parties: { select: { userId: true } } } } },
  })
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  const isCreator = payment.deal.createdById === userId
  const isParty = payment.deal.parties.some((p) => p.userId === userId)
  if (!isCreator && !isParty) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = UpdatePaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (parsed.data.status !== undefined) update.status = parsed.data.status
  if (parsed.data.method !== undefined) update.method = parsed.data.method
  if (parsed.data.reference !== undefined) update.reference = parsed.data.reference
  if (parsed.data.status === 'paid') {
    update.paidAt = parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date()
    update.paidBy = userId
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: update as never,
  })

  await logAudit({
    dealId: payment.dealId,
    action: 'payment_updated',
    actorId: userId,
    metadata: { paymentId: id, status: parsed.data.status },
  })

  return NextResponse.json({ data: paymentToApi(updated) })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { deal: { select: { createdById: true } } },
  })
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  if (payment.deal.createdById !== userId) {
    return NextResponse.json({ error: 'Only the deal creator can delete payments' }, { status: 403 })
  }

  await prisma.payment.delete({ where: { id } })

  await logAudit({
    dealId: payment.dealId,
    action: 'payment_deleted',
    actorId: userId,
    metadata: { paymentId: id, description: payment.description },
  })

  return NextResponse.json({ data: { ok: true } })
}
