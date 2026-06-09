import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { initializeTransaction } from '@/lib/paystack'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paymentId } = await request.json()
    if (!paymentId) return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { deal: { include: { parties: { select: { userId: true } } } } },
    })
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const isCreator = payment.deal.createdById === userId
    const isParty = payment.deal.parties.some((p) => p.userId === userId)
    if (!isCreator && !isParty) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (payment.status === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const email = user?.email ?? `${userId}@signnest.ng`

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const callbackUrl = `${appUrl}/deals/${payment.dealId}/payments?ref=${paymentId}`

    const result = await initializeTransaction({
      email,
      amount: Number(payment.amount),
      reference: paymentId,
      callbackUrl,
      metadata: { dealId: payment.dealId, paymentId, description: payment.description },
    })

    return NextResponse.json({ data: { authorization_url: result.authorization_url } })
  } catch (e) {
    console.error('Paystack init error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 },
    )
  }
}
