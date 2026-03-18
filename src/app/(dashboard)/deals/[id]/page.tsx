'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PartyList } from '@/components/deals/PartyList'
import { InvitePartyModal } from '@/components/deals/InvitePartyModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatNaira } from '@/types'
import type { Deal } from '@/types'

export default function DealOverviewPage() {
  const params = useParams()
  const id = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    if (urlParams.get('welcome')) setShowInviteModal(true)
  }, [])

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setDeal(data))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [id])

  const refresh = () => fetch(`/api/deals/${id}`).then((r) => r.json()).then(({ data }) => setDeal(data))

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-warm-900">Parties</h2>
          {deal.status !== 'completed' && deal.status !== 'cancelled' && (
            <Button onClick={() => setShowInviteModal(true)}>Invite Party</Button>
          )}
        </div>
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
