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
    { href: `${base}/audit`, label: 'Audit Trail' },
  ]

  const activeTab = pathname === base ? base : pathname.split('/').slice(0, 4).join('/')

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-600">{deal.title}</h1>
          <p className="mt-1 text-navy-400">{deal.property_address}</p>
          <div className="mt-2 flex items-center gap-2">
            <DealStatusBadge status={deal.status} />
            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-navy-500">
              {deal.deal_type}
            </span>
          </div>
        </div>
        <DealTimeline status={deal.status} completedAt={deal.completed_at} />
      </div>

      <nav className="flex gap-2 overflow-x-auto border-b border-cream-300 pb-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              pathname === tab.href || (tab.href !== base && pathname.startsWith(tab.href))
                ? 'border-b-2 border-gold-500 text-gold-600'
                : 'text-navy-400 hover:text-navy-600'
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
