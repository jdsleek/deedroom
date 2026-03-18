'use client'

import { useEffect, useState } from 'react'
import { Users, Handshake, FileText, ShieldCheck, TrendingUp, CheckCircle } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

interface Stats {
  totalUsers: number
  totalDeals: number
  dealsByStatus: Record<string, number>
  totalDocuments: number
  totalSignatures: number
  pendingKyc: number
  revenue: number
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-warm-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-warm-100 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <p className="text-warm-500">Failed to load stats.</p>
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'coral' as const },
    { label: 'Total Deals', value: stats.totalDeals, icon: Handshake, color: 'teal' as const },
    { label: 'Active Deals', value: (stats.dealsByStatus['draft'] ?? 0) + (stats.dealsByStatus['sent'] ?? 0) + (stats.dealsByStatus['viewing'] ?? 0) + (stats.dealsByStatus['signing'] ?? 0), icon: TrendingUp, color: 'gold' as const },
    { label: 'Completed Deals', value: stats.dealsByStatus['completed'] ?? 0, icon: CheckCircle, color: 'teal' as const },
    { label: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'coral' as const },
    { label: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'gold' as const },
  ]

  const colorMap = {
    coral: { bg: 'bg-coral-50', icon: 'text-coral-500', value: 'text-coral-600' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-500', value: 'text-teal-600' },
    gold: { bg: 'bg-gold-50', icon: 'text-gold-500', value: 'text-gold-600' },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-warm-900">Admin Overview</h1>
        <p className="text-warm-500 text-sm mt-1">Platform-wide metrics at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          const c = colorMap[card.color]
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-warm-500 text-sm font-medium">{card.label}</p>
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
              </div>
              <p className={`text-3xl font-display font-bold mt-2 ${c.value}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>

      {/* Revenue */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-lg font-bold text-warm-900 mb-1">Revenue from Completed Deals</h2>
        <p className="text-warm-500 text-sm mb-4">Agency + legal fees from completed deals</p>
        <p className="text-4xl font-display font-bold text-teal-600">{formatNaira(stats.revenue)}</p>
      </div>

      {/* Deal status breakdown */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-lg font-bold text-warm-900 mb-4">Deals by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['draft', 'sent', 'viewing', 'signing', 'completed', 'cancelled'] as const).map((status) => {
            const count = stats.dealsByStatus[status] ?? 0
            const statusColors: Record<string, string> = {
              draft: 'bg-warm-100 text-warm-600',
              sent: 'bg-blue-50 text-blue-600',
              viewing: 'bg-purple-50 text-purple-600',
              signing: 'bg-amber-50 text-amber-600',
              completed: 'bg-teal-50 text-teal-600',
              cancelled: 'bg-red-50 text-red-600',
            }
            return (
              <div key={status} className={`rounded-xl p-3 text-center ${statusColors[status]}`}>
                <p className="text-2xl font-display font-bold">{count}</p>
                <p className="text-xs font-semibold capitalize mt-0.5">{status}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Signatures */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-warm-900">Signatures Collected</h2>
            <p className="text-warm-500 text-sm mt-0.5">Total verified signatures across all deals</p>
          </div>
          <p className="text-3xl font-display font-bold text-coral-500">{stats.totalSignatures.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
