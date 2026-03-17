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
        <h1 className="font-display text-2xl font-semibold text-navy-600">Deals</h1>
        <Link href="/deals/new">
          <Button>+ New Deal</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-navy-600 text-white'
                  : 'bg-cream-200 text-navy-400 hover:bg-cream-300'
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
            className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-navy-600"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-cream-400 bg-cream-50 p-12 text-center">
          <p className="text-navy-400">No deals found</p>
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
