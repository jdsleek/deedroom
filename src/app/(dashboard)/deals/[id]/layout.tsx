'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { DealStatusBadge } from '@/components/deals/DealStatusBadge'
import type { Deal } from '@/types'

export default function DealRoomLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const isOverview = pathname === base

  return (
    <div className="space-y-6">
      {!isOverview && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/deals" className="text-warm-500 hover:text-warm-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="font-display text-lg font-bold text-navy-500">{deal.title}</h1>
            <div className="ml-auto flex items-center gap-2">
              <DealStatusBadge status={deal.status} />
            </div>
          </div>

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
        </>
      )}

      {children}
    </div>
  )
}
