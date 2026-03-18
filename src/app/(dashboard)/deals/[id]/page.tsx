'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { PartyList } from '@/components/deals/PartyList'
import { InvitePartyModal } from '@/components/deals/InvitePartyModal'
import { DealTimeline } from '@/components/deals/DealTimeline'
import { DealStatusBadge } from '@/components/deals/DealStatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatNaira } from '@/types'
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

  const refresh = () => fetch(`/api/deals/${id}`).then((r) => r.json()).then(({ data }) => setDeal(data))

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-warm-900">{deal.title}</h1>
            <p className="mt-1 text-warm-600">{deal.property_address}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DealStatusBadge status={deal.status} />
              <span className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-600">
                {deal.deal_type}
              </span>
              {deal.status !== 'completed' && deal.status !== 'cancelled' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDisputeModal(true)}
                  className="gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Raise Dispute
                </Button>
              )}
            </div>
          </div>
          <DealTimeline status={deal.status} completedAt={deal.completed_at} />
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

      <nav className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive(tab.href)
                ? 'bg-coral-500 text-white'
                : 'border border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-warm-900">Property Details</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-warm-500">Property type</dt>
              <dd className="text-warm-800">{deal.property_type ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-warm-500">Description</dt>
              <dd className="text-warm-800">{deal.description ?? '—'}</dd>
            </div>
          </dl>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-warm-900">Financial Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {deal.deal_type === 'rent' && deal.rent_amount != null && (
              <div>
                <dt className="text-warm-500">Rent</dt>
                <dd className="text-warm-800">{formatNaira(deal.rent_amount)} / {deal.rent_period ?? 'month'}</dd>
              </div>
            )}
            {deal.deal_type === 'rent' && deal.caution_fee != null && deal.caution_fee > 0 && (
              <div>
                <dt className="text-warm-500">Caution fee</dt>
                <dd className="text-warm-800">{formatNaira(deal.caution_fee)}</dd>
              </div>
            )}
            {deal.agency_fee != null && deal.agency_fee > 0 && (
              <div>
                <dt className="text-warm-500">Agency fee</dt>
                <dd className="text-warm-800">{formatNaira(deal.agency_fee)}</dd>
              </div>
            )}
            {deal.legal_fee != null && deal.legal_fee > 0 && (
              <div>
                <dt className="text-warm-500">Legal fee</dt>
                <dd className="text-warm-800">{formatNaira(deal.legal_fee)}</dd>
              </div>
            )}
            {deal.deal_type === 'sale' && deal.sale_price != null && (
              <div>
                <dt className="text-warm-500">Sale price</dt>
                <dd className="font-medium text-warm-900">{formatNaira(deal.sale_price)}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <Card className="p-6">
        <PartyList
          parties={deal.parties ?? []}
          onInvite={() => setShowInviteModal(true)}
          canInvite={deal.status !== 'completed' && deal.status !== 'cancelled'}
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
