import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { verifyTransaction } from '@/lib/paystack'
import { logAudit } from '@/lib/audit'
import { paymentToApi } from '@/lib/serialize'
import { notifyMany } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reference } = await request.json()
    if (!reference) return NextResponse.json({ error: 'reference is required' }, { status: 400 })

    const payment = await prisma.payment.findUnique({ where: { id: reference } })
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    if (payment.status === 'paid') {
      return NextResponse.json({ data: paymentToApi(payment) })
    }

    const result = await verifyTransaction(reference)

    if (result.status === 'success') {
      const updated = await prisma.payment.update({
        where: { id: reference },
        data: {
          status: 'paid',
          method: 'paystack',
          paidAt: new Date(result.paid_at),
          paidBy: userId,
          reference: result.reference,
        },
      })

      await logAudit({
        dealId: payment.dealId,
        action: 'payment_verified',
        actorId: userId,
        metadata: { paymentId: reference, method: 'paystack', amount: result.amount },
      })

      const deal = await prisma.deal.findUnique({
        where: { id: payment.dealId },
        select: { title: true, createdById: true, parties: { select: { userId: true } } },
      })
      if (deal) {
        const userIds = deal.parties
          .filter((p) => p.userId && p.userId !== userId)
          .map((p) => p.userId as string)
        if (deal.createdById && deal.createdById !== userId) userIds.push(deal.createdById)
        const uniqueIds = [...new Set(userIds)]
        if (uniqueIds.length > 0) {
          await notifyMany(
            uniqueIds.map((uid) => ({
              userId: uid,
              type: 'payment',
              title: 'Payment Received',
              message: `Payment of NGN ${(Number(payment.amount) / 100).toLocaleString()} for "${deal.title}" has been verified`,
              link: `/deals/${payment.dealId}/payments`,
            }))
          )
        }
      }

      return NextResponse.json({ data: paymentToApi(updated) })
    }

    return NextResponse.json(
      { error: `Payment not successful. Status: ${result.status}` },
      { status: 400 },
    )
  } catch (e) {
    console.error('Paystack verify error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 },
    )
  }
}
