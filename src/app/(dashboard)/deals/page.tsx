'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DealCard } from '@/components/deals/DealCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Deal } from '@/types'

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled'

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'status'>('newest')

  useEffect(() => {
    async function fetchDeals() {
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') params.set('status', filter)
        if (search) params.set('search', search)
        params.set('sort', sort)
        const res = await fetch(`/api/deals?${params}`)
        const { data } = await res.json()
        setDeals(data ?? [])
      } catch {
        setDeals([])
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [filter, search, sort])

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-warm-900">Deals</h1>
        <Link href="/deals/new">
          <Button>+ New Deal</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-coral-500 text-white'
                  : 'border border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-xl border border-warm-200 bg-white px-3 py-2 text-sm text-warm-800 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-warm-200 bg-warm-50 p-12 text-center shadow-xs">
          <p className="text-warm-600">No deals found</p>
          <Link href="/deals/new" className="mt-4 inline-block">
            <Button>Create your first deal</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
