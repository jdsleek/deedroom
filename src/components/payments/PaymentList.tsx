'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatNaira, PAYMENT_STATUS_CONFIG } from '@/types'
import type { Payment, Deal } from '@/types'
import { AddPaymentModal } from './AddPaymentModal'

interface PaymentListProps {
  payments: Payment[]
  deal: Deal
  canManage: boolean
  onRefresh: () => void
}

export function PaymentList({ payments, deal, canManage, onRefresh }: PaymentListProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const handleMarkPaid = async (paymentId: string) => {
    setMarkingId(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (!res.ok) throw new Error('Failed')
      onRefresh()
    } catch {
      // silently fail
    } finally {
      setMarkingId(null)
    }
  }

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Delete this payment record?')) return
    setDeletingId(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      onRefresh()
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownloadReceipt = (paymentId: string) => {
    window.open(`/api/payments/${paymentId}/receipt`, '_blank')
  }

  const handlePayWithPaystack = async (paymentId: string) => {
    setPayingId(paymentId)
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to initialize payment')
      window.location.href = json.data.authorization_url
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Payment initialization failed')
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-warm-500">Total Payments</p>
          <p className="mt-1 font-display text-2xl font-bold text-warm-900">{payments.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-teal-600">Total Paid</p>
          <p className="mt-1 font-display text-2xl font-bold text-teal-600">{formatNaira(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-amber-600">Pending</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">{formatNaira(totalPending)}</p>
        </Card>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-warm-900">Payments</h2>
        {canManage && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            + Add Payment
          </Button>
        )}
      </div>

      {/* Payments list */}
      {payments.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warm-100">
            <svg className="h-6 w-6 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-warm-700">No payments yet</p>
          <p className="mt-1 text-xs text-warm-500">Add payment records to track deal finances</p>
          {canManage && (
            <Button size="sm" className="mt-4" onClick={() => setShowAddModal(true)}>
              + Add Payment
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const config = PAYMENT_STATUS_CONFIG[payment.status]
            return (
              <Card key={payment.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-warm-900">{payment.description}</p>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-500">
                      <span className="font-display text-base font-bold text-warm-800">
                        {formatNaira(payment.amount)}
                      </span>
                      {payment.method && (
                        <span className="rounded bg-warm-50 px-1.5 py-0.5">{payment.method.replace('_', ' ')}</span>
                      )}
                      {payment.reference && <span>Ref: {payment.reference}</span>}
                      {payment.paid_at && (
                        <span>Paid {new Date(payment.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      <span>Added {new Date(payment.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handlePayWithPaystack(payment.id)}
                        isLoading={payingId === payment.id}
                      >
                        Pay with Paystack
                      </Button>
                    )}
                    {payment.status === 'pending' && canManage && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkPaid(payment.id)}
                        isLoading={markingId === payment.id}
                      >
                        Mark Paid
                      </Button>
                    )}
                    {payment.status === 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(payment.id)}
                      >
                        Receipt
                      </Button>
                    )}
                    {canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(payment.id)}
                        disabled={deletingId === payment.id}
                        className="text-warm-400 hover:text-red-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Paystack info */}
      <Card className="border-dashed border-teal-300 bg-teal-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100">
            <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-teal-800">Online payments via Paystack</p>
            <p className="mt-0.5 text-xs text-warm-500">
              Pending payments can be paid online using Paystack. Click &quot;Pay with Paystack&quot; on any pending payment above.
            </p>
          </div>
        </div>
      </Card>

      <AddPaymentModal
        dealId={deal.id}
        deal={deal}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={onRefresh}
      />
    </div>
  )
}
