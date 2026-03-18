'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { PaymentList } from '@/components/payments/PaymentList'
import type { Deal, Payment } from '@/types'

export default function DealPaymentsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const ref = searchParams.get('ref')
  const [deal, setDeal] = useState<Deal | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const verifiedRef = useRef(false)

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

  useEffect(() => {
    if (!ref || verifiedRef.current) return
    verifiedRef.current = true
    setVerifyStatus('verifying')
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref }),
    })
      .then(async (res) => {
        if (res.ok) {
          setVerifyStatus('success')
          fetchData()
        } else {
          setVerifyStatus('error')
        }
      })
      .catch(() => setVerifyStatus('error'))
  }, [ref, fetchData])

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {verifyStatus === 'verifying' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Verifying your payment...
        </div>
      )}
      {verifyStatus === 'success' && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          Payment confirmed successfully!
        </div>
      )}
      {verifyStatus === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Payment verification failed. Please contact support if you were charged.
        </div>
      )}
      <PaymentList
        payments={payments}
        deal={deal}
        canManage={deal.status !== 'completed' && deal.status !== 'cancelled'}
        onRefresh={fetchData}
      />
    </div>
  )
}
