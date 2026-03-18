'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { DealTimeline } from '@/components/deals/DealTimeline'
import { DealStatusBadge } from '@/components/deals/DealStatusBadge'
import type { Deal } from '@/types'

export default function DealRoomLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setDeal(data))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [id])

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

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
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
            <div className="mt-2 flex items-center gap-2">
              <DealStatusBadge status={deal.status} />
              <span className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-medium text-warm-600">
                {deal.deal_type}
              </span>
            </div>
          </div>
          <DealTimeline status={deal.status} completedAt={deal.completed_at} />
        </div>
      </div>

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

      {children}
    </div>
  )
}
