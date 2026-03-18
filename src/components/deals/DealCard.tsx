'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { FileText, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { DealStatusBadge } from './DealStatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { formatNaira } from '@/types'
import { cn } from '@/lib/utils'

interface DealCardProps {
  deal: {
    id: string
    deal_type: string
    status: string
    title: string
    property_address: string
    created_at: string
    rent_amount?: number | null
    sale_price?: number | null
    rent_period?: string | null
    party_count?: number
    doc_count?: number
    signed_count?: number
    parties?: Array<{ id: string; status: string }>
    documents?: Array<{ id: string }>
  }
}

const STATUS_STRIPE_COLORS: Record<string, string> = {
  draft: 'bg-warm-400',
  sent: 'bg-blue-500',
  viewing: 'bg-purple-500',
  signing: 'bg-amber-500',
  completed: 'bg-teal-500',
  cancelled: 'bg-red-500',
}

export function DealCard({ deal }: DealCardProps) {
  const partyCount = deal.party_count ?? deal.parties?.length ?? 0
  const docCount = deal.doc_count ?? deal.documents?.length ?? 0
  const signedCount =
    deal.signed_count ?? deal.parties?.filter((p) => p.status === 'signed').length ?? 0
  const progress = partyCount > 0 ? (signedCount / partyCount) * 100 : 0

  const amount = deal.deal_type === 'rent' ? deal.rent_amount ?? 0 : deal.sale_price ?? 0
  const stripeColor = STATUS_STRIPE_COLORS[deal.status] ?? 'bg-warm-400'

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex">
          {/* Left color stripe */}
          <div className={cn('w-[3px] flex-shrink-0', stripeColor)} aria-hidden />

          <div className="flex-1 min-w-0 p-5">
            <h3 className="font-display font-bold text-warm-900 truncate">{deal.title}</h3>
            <p className="text-warm-500 text-sm mt-0.5 truncate">{deal.property_address}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <DealStatusBadge status={deal.status} />
              <Badge variant="outline" className="text-xs">
                {deal.deal_type === 'rent' ? 'Rent' : 'Sale'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-warm-500">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-warm-400" />
                {partyCount} {partyCount === 1 ? 'party' : 'parties'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-warm-400" />
                {docCount} {docCount === 1 ? 'doc' : 'docs'}
              </span>
              {amount > 0 && (
                <span className="font-medium text-warm-700">
                  {formatNaira(amount)}
                  {deal.deal_type === 'rent' && deal.rent_period && `/${deal.rent_period}`}
                </span>
              )}
              <span>{format(new Date(deal.created_at), 'MMM d, yyyy')}</span>
            </div>

            {(deal.status === 'signing' || deal.status === 'viewing' || deal.status === 'sent') && (
              <div className="mt-3">
                <ProgressBar value={progress} className="h-1.5" />
                <p className="text-xs text-warm-500 mt-1">
                  {signedCount} of {partyCount} signed
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
