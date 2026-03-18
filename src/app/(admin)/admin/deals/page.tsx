'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface AdminDeal {
  id: string
  title: string
  dealType: string
  status: string
  propertyAddress: string
  creatorName: string
  creatorEmail: string | null
  partiesCount: number
  documentsCount: number
  createdAt: string
  completedAt: string | null
}

interface DealsResponse {
  deals: AdminDeal[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_OPTIONS = ['', 'draft', 'sent', 'viewing', 'signing', 'completed', 'cancelled']

function statusBadgeVariant(status: string) {
  const map: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger' | 'secondary'> = {
    draft: 'default',
    sent: 'info',
    viewing: 'secondary',
    signing: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return map[status] ?? 'default'
}

export default function AdminDealsPage() {
  const [data, setData] = useState<DealsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/deals?${params}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-warm-900">Deals</h1>
        <p className="text-warm-500 text-sm mt-1">All deals across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
          <input
            type="text"
            placeholder="Search by title or address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-11 px-3.5 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-warm-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/50">
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600">Deal</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden md:table-cell">Creator</th>
                <th className="text-center px-5 py-3.5 font-semibold text-warm-600 hidden lg:table-cell">Parties</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-warm-50">
                    <td colSpan={5} className="px-5 py-4"><div className="h-5 bg-warm-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.deals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-warm-400">No deals found</td>
                </tr>
              ) : (
                data?.deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-warm-50 hover:bg-warm-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="font-medium text-warm-900 truncate">{deal.title}</p>
                        <p className="text-warm-400 text-xs truncate">{deal.propertyAddress}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <Badge variant={statusBadgeVariant(deal.status)}>{deal.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-warm-700 truncate">{deal.creatorName}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center text-warm-600 hidden lg:table-cell">
                      {deal.partiesCount}
                    </td>
                    <td className="px-5 py-3.5 text-warm-500 hidden lg:table-cell">
                      {new Date(deal.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-warm-100">
            <p className="text-sm text-warm-500">
              Page {data.page} of {data.totalPages} ({data.total} deals)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-warm-200 text-warm-500 hover:bg-warm-50 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-warm-200 text-warm-500 hover:bg-warm-50 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
