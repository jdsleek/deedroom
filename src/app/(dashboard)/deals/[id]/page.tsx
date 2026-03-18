'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { PartyList } from '@/components/deals/PartyList'
import { InvitePartyModal } from '@/components/deals/InvitePartyModal'
import { DealStatusBadge } from '@/components/deals/DealStatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatNaira } from '@/types'
import { useAutoRefresh } from '@/hooks/usePolling'
import type { Deal } from '@/types'
import { AlertTriangle, X } from 'lucide-react'

export default function DealOverviewPage() {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    if (urlParams.get('welcome')) setShowInviteModal(true)
  }, [])

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) { setError(json.error); setDeal(null) }
        else setDeal(json.data)
      })
      .catch(() => setError('Failed to load deal'))
      .finally(() => setLoading(false))
  }, [id])

  const refresh = useCallback(() => fetch(`/api/deals/${id}`).then((r) => r.json()).then(({ data }) => setDeal(data)), [id])

  useAutoRefresh(refresh, 15000)

  const base = `/deals/${id}`
  const tabs = [
    { href: base, label: 'Overview' },
    { href: `${base}/documents`, label: 'Documents' },
    { href: `${base}/signatures`, label: 'Signatures' },
    { href: `${base}/payments`, label: 'Payments' },
    { href: `${base}/audit`, label: 'Audit Trail' },
  ]
  const isActive = (tabHref: string) =>
    pathname === tabHref || (tabHref !== base && pathname.startsWith(tabHref))

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
        <p className="text-warm-600">{error || 'Deal not found'}</p>
        <Link href="/deals" className="text-sm font-medium text-coral-500 hover:text-coral-600">Back to Deals</Link>
      </div>
    )
  }

  if (deal.status === 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/deals" className="text-warm-500 hover:text-warm-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-display text-lg font-bold text-navy-500">Deal Completed</h1>
          <div className="ml-auto w-6 h-6 rounded-full bg-coral-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-warm-200 shadow-xs overflow-hidden">
          <div className="bg-coral-50 py-12 flex flex-col items-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-coral-500 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-500">Success!</h2>
            <p className="text-warm-600 mt-2 max-w-sm">
              {deal.title} has been completed. Executed copy is saved.
            </p>
          </div>

          <div className="p-6 space-y-3">
            <Link
              href={`/deals/${deal.id}/documents`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-coral-500 px-6 py-3.5 text-white font-semibold hover:bg-coral-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View Document
            </Link>
            <Link
              href={`/deals/${deal.id}/audit`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-coral-500 px-6 py-3.5 text-white font-semibold hover:bg-coral-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download PDF
            </Link>
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-coral-500 px-6 py-3.5 text-white font-semibold hover:bg-coral-600 transition-colors"
              onClick={() => {
                const text = `${deal.title} has been completed on SignNest! View the deal: ${window.location.origin}/deals/${deal.id}`
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`
                window.open(url, '_blank')
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              Share via WhatsApp
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/deals" className="text-warm-500 hover:text-warm-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="font-display text-lg font-bold text-navy-500">{deal.title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard" className="text-warm-400 hover:text-warm-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-warm-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5">
          <h2 className="font-display text-lg font-bold text-navy-500">{deal.title}</h2>
          <p className="text-warm-500 text-sm mt-1">{deal.property_address}</p>
          {deal.deal_type === 'rent' && deal.rent_amount != null && (
            <p className="text-sm text-navy-500 font-medium mt-2">
              Rent: {formatNaira(deal.rent_amount)} / {deal.rent_period ?? 'year'}
            </p>
          )}
          {deal.deal_type === 'sale' && deal.sale_price != null && (
            <p className="text-sm text-navy-500 font-medium mt-2">
              Price: {formatNaira(deal.sale_price)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DealStatusBadge status={deal.status} />
            <span className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-600">
              {deal.deal_type}
            </span>
            {deal.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisputeModal(true)}
                className="gap-1.5 ml-auto"
              >
                <AlertTriangle className="h-4 w-4" />
                Raise Dispute
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Raise Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-warm-100">
              <h2 className="font-display text-lg font-bold text-warm-900">Raise Dispute</h2>
              <button type="button" onClick={() => { setShowDisputeModal(false); setDisputeReason('') }} className="text-warm-400 hover:text-warm-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-warm-600">
                Describe the issue with this deal. An admin will review your dispute.
              </p>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">Reason</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain the problem..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 resize-none placeholder:text-warm-400"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-warm-100">
              <Button variant="outline" className="flex-1" onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                isLoading={disputeSubmitting}
                disabled={!disputeReason.trim()}
                onClick={async () => {
                  if (!disputeReason.trim()) return
                  setDisputeSubmitting(true)
                  try {
                    const res = await fetch('/api/disputes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deal_id: deal!.id, reason: disputeReason.trim() }),
                    })
                    const json = await res.json()
                    if (res.ok) {
                      setShowDisputeModal(false)
                      setDisputeReason('')
                    } else {
                      alert(json.error ?? 'Failed to raise dispute')
                    }
                  } catch (e) {
                    alert('Failed to raise dispute')
                  } finally {
                    setDisputeSubmitting(false)
                  }
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      <nav className="flex border-b border-warm-200 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              isActive(tab.href)
                ? 'border-navy-500 text-navy-500'
                : 'border-transparent text-warm-500 hover:text-warm-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <Card className="p-6">
        <PartyList
          parties={deal.parties ?? []}
          onInvite={() => setShowInviteModal(true)}
          canInvite={deal.status !== 'cancelled'}
        />
        <InvitePartyModal
          dealId={deal.id}
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={refresh}
        />
      </Card>
    </div>
  )
}
