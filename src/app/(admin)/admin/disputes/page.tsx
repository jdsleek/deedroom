'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Dispute {
  id: string
  dealId: string
  dealTitle: string
  raisedById: string
  raisedByName: string
  reason: string
  status: string
  resolution: string | null
  resolvedById: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DisputesResponse {
  disputes: Dispute[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const STATUS_OPTIONS = ['open', 'investigating', 'resolved', 'dismissed']

function statusBadgeVariant(status: string) {
  if (status === 'open') return 'warning'
  if (status === 'investigating') return 'info'
  if (status === 'resolved') return 'success'
  if (status === 'dismissed') return 'secondary'
  return 'default'
}

export default function AdminDisputesPage() {
  const [data, setData] = useState<DisputesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editResolution, setEditResolution] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchDisputes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/disputes?${params}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchDisputes() }, [fetchDisputes])

  useEffect(() => {
    if (expandedId && data?.disputes) {
      const d = data.disputes.find((x) => x.id === expandedId)
      if (d) {
        setEditStatus(d.status)
        setEditResolution(d.resolution ?? '')
      }
    }
  }, [expandedId, data?.disputes])

  const handleUpdate = async () => {
    if (!expandedId) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expandedId,
          status: editStatus,
          resolution: editResolution.trim() || undefined,
        }),
      })
      if (res.ok) {
        setExpandedId(null)
        fetchDisputes()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-warm-900">Disputes</h1>
        <p className="text-warm-500 text-sm mt-1">Review and resolve deal disputes</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => { setStatusFilter(tab.value); setPage(1) }}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-coral-500 text-white'
                : 'border border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-warm-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/50">
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600">Deal</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600">Raised by</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden md:table-cell">Reason</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden lg:table-cell">Date</th>
                <th className="text-right px-5 py-3.5 font-semibold text-warm-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-warm-50">
                    <td colSpan={6} className="px-5 py-4"><div className="h-5 bg-warm-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.disputes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-teal-500" />
                      </div>
                      <p className="font-medium text-warm-700">No disputes found</p>
                      <p className="text-warm-400 text-sm">
                        {statusFilter ? `No disputes with status "${statusFilter}"` : 'All clear'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.disputes.map((d) => (
                  <React.Fragment key={d.id}>
                    <tr
                      key={d.id}
                      className="border-b border-warm-50 hover:bg-warm-50/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-warm-900 truncate max-w-[180px]">{d.dealTitle}</p>
                        <p className="text-warm-400 text-xs truncate max-w-[180px]">{d.dealId}</p>
                      </td>
                      <td className="px-5 py-3.5 text-warm-700">{d.raisedByName}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-warm-600 max-w-[200px] truncate" title={d.reason}>
                        {d.reason}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusBadgeVariant(d.status)}>{d.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-warm-500 hidden lg:table-cell">
                        {new Date(d.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                          className="inline-flex items-center gap-1 text-coral-500 hover:text-coral-600 text-sm font-semibold transition-colors"
                        >
                          {expandedId === d.id ? (
                            <>Collapse <ChevronUp className="h-4 w-4" /></>
                          ) : (
                            <>Resolve <ChevronDown className="h-4 w-4" /></>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedId === d.id && (
                      <tr key={`${d.id}-expand`} className="border-b border-warm-100 bg-warm-50/30">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="rounded-xl border border-warm-200 bg-white p-5 space-y-4 max-w-2xl">
                            <h3 className="font-semibold text-warm-800">Update dispute</h3>
                            <div>
                              <label className="block text-sm font-medium text-warm-700 mb-1.5">Status</label>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400"
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-warm-700 mb-1.5">Resolution</label>
                              <textarea
                                value={editResolution}
                                onChange={(e) => setEditResolution(e.target.value)}
                                placeholder="Enter resolution notes..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 resize-none"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>
                                Cancel
                              </Button>
                              <Button variant="primary" size="sm" isLoading={saving} onClick={handleUpdate}>
                                Save
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-warm-100">
            <p className="text-sm text-warm-500">
              Page {data.page} of {data.totalPages} ({data.total} disputes)
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
