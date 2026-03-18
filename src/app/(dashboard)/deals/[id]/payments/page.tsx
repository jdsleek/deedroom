'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { PaymentList } from '@/components/payments/PaymentList'
import type { Deal, Payment } from '@/types'

export default function DealPaymentsPage() {
  const params = useParams()
  const id = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [dealRes, payRes] = await Promise.all([
        fetch(`/api/deals/${id}`),
        fetch(`/api/payments?dealId=${id}`),
      ])
      const dealJson = await dealRes.json()
      const payJson = await payRes.json()
      setDeal(dealJson.data ?? null)
      setPayments(payJson.data ?? [])
    } catch {
      setDeal(null)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <PaymentList
      payments={payments}
      deal={deal}
      canManage={deal.status !== 'completed' && deal.status !== 'cancelled'}
      onRefresh={fetchData}
    />
  )
}
