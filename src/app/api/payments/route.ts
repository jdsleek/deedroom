import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'
import { paymentToApi } from '@/lib/serialize'

const CreatePaymentSchema = z.object({
  dealId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  method: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dealId = searchParams.get('dealId')
  if (!dealId) return NextResponse.json({ error: 'dealId is required' }, { status: 400 })

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { parties: { select: { userId: true } } },
  })
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const isCreator = deal.createdById === userId
  const isParty = deal.parties.some((p) => p.userId === userId)
  if (!isCreator && !isParty) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payments = await prisma.payment.findMany({
    where: { dealId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: payments.map(paymentToApi) })
}

export async function POST(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CreatePaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { dealId, description, amount, method } = parsed.data

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { parties: { select: { userId: true } } },
  })
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const isCreator = deal.createdById === userId
  const isParty = deal.parties.some((p) => p.userId === userId)
  if (!isCreator && !isParty) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payment = await prisma.payment.create({
    data: {
      dealId,
      description,
      amount: BigInt(amount),
      method: method ?? null,
    },
  })

  await logAudit({
    dealId,
    action: 'payment_created',
    actorId: userId,
    metadata: { paymentId: payment.id, description, amount },
  })

  return NextResponse.json({ data: paymentToApi(payment) })
}
