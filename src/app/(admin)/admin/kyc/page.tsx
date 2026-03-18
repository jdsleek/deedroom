'use client'

import { useEffect, useState, useCallback } from 'react'
import { ShieldCheck, ShieldX, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface KycUser {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  kycStatus: string
  companyName: string | null
  createdAt: string
  userName: string | null
}

interface UsersResponse {
  users: KycUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminKycPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<KycUser | null>(null)
  const [acting, setActing] = useState(false)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search: '' })
      const res = await fetch(`/api/admin/users?${params}`)
      const json = await res.json()
      const filtered = {
        ...json,
        users: json.users?.filter((u: KycUser) => u.kycStatus === 'pending') ?? [],
      }
      filtered.total = filtered.users.length
      setData(filtered)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchPending() }, [fetchPending])

  const handleAction = async (userId: string, status: 'verified' | 'rejected') => {
    setActing(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, kycStatus: status }),
      })
      if (res.ok) {
        setSelectedUser(null)
        fetchPending()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-warm-900">KYC Reviews</h1>
        <p className="text-warm-500 text-sm mt-1">Review and approve user verification requests</p>
      </div>

      <div className="rounded-2xl border border-warm-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/50">
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden md:table-cell">Company</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden lg:table-cell">Joined</th>
                <th className="text-right px-5 py-3.5 font-semibold text-warm-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-warm-50">
                    <td colSpan={5} className="px-5 py-4"><div className="h-5 bg-warm-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-teal-500" />
                      </div>
                      <p className="font-medium text-warm-700">All caught up!</p>
                      <p className="text-warm-400 text-sm">No pending KYC reviews</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr key={user.id} className="border-b border-warm-50 hover:bg-warm-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-gold-600">
                            {(user.fullName || '?').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-warm-900 truncate">{user.fullName}</p>
                          <p className="text-warm-400 text-xs truncate">{user.email ?? user.phone ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-warm-600 hidden md:table-cell">
                      {user.companyName ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-warm-500 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-50 transition-all"
                          title="Review"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(user.id, 'verified')}
                          className="p-1.5 rounded-lg text-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-all"
                          title="Approve"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(user.id, 'rejected')}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Reject"
                        >
                          <ShieldX className="h-4 w-4" />
                        </button>
                      </div>
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
              Page {data.page} of {data.totalPages}
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

      {/* Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-warm-100">
              <h2 className="font-display text-lg font-bold text-warm-900">KYC Review</h2>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-warm-400 hover:text-warm-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-gold-600">
                    {(selectedUser.fullName || '?').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-warm-900 text-lg">{selectedUser.fullName}</p>
                  <p className="text-warm-500 text-sm">{selectedUser.email ?? selectedUser.phone ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-warm-50 p-3">
                  <p className="text-xs text-warm-500 mb-0.5">Role</p>
                  <p className="font-medium text-warm-800 capitalize">{selectedUser.role}</p>
                </div>
                <div className="rounded-xl bg-warm-50 p-3">
                  <p className="text-xs text-warm-500 mb-0.5">KYC Status</p>
                  <Badge variant="warning">{selectedUser.kycStatus}</Badge>
                </div>
                <div className="rounded-xl bg-warm-50 p-3">
                  <p className="text-xs text-warm-500 mb-0.5">Company</p>
                  <p className="font-medium text-warm-800">{selectedUser.companyName ?? '—'}</p>
                </div>
                <div className="rounded-xl bg-warm-50 p-3">
                  <p className="text-xs text-warm-500 mb-0.5">Joined</p>
                  <p className="font-medium text-warm-800">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-warm-200 p-4 bg-warm-50/50">
                <p className="text-sm text-warm-500 text-center">
                  KYC documents uploaded by the user can be viewed from the platform storage.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-warm-100">
              <Button
                variant="danger"
                className="flex-1"
                isLoading={acting}
                onClick={() => handleAction(selectedUser.id, 'rejected')}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                isLoading={acting}
                onClick={() => handleAction(selectedUser.id, 'verified')}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
