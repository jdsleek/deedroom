'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface AdminUser {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  kycStatus: string
  companyName: string | null
  avatarUrl: string | null
  createdAt: string
  userName: string | null
  userImage: string | null
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ROLES = ['realtor', 'landlord', 'tenant', 'buyer', 'developer', 'lawyer', 'admin']
const KYC_STATUSES = ['pending', 'verified', 'rejected']

function kycBadgeVariant(status: string) {
  if (status === 'verified') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editKyc, setEditKyc] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    if (selectedUser) {
      setEditRole(selectedUser.role)
      setEditKyc(selectedUser.kycStatus)
    }
  }, [selectedUser])

  const handleUpdate = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, role: editRole, kycStatus: editKyc }),
      })
      if (res.ok) {
        setSelectedUser(null)
        fetchUsers()
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
        <h1 className="font-display text-2xl font-bold text-warm-900">Users</h1>
        <p className="text-warm-500 text-sm mt-1">Manage all registered users</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400 transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-warm-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100 bg-warm-50/50">
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden md:table-cell">KYC</th>
                <th className="text-left px-5 py-3.5 font-semibold text-warm-600 hidden lg:table-cell">Joined</th>
                <th className="text-right px-5 py-3.5 font-semibold text-warm-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-warm-50">
                    <td colSpan={5} className="px-5 py-4"><div className="h-5 bg-warm-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-warm-400">No users found</td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr key={user.id} className="border-b border-warm-50 hover:bg-warm-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-coral-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-coral-600">
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
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge variant={kycBadgeVariant(user.kycStatus)}>{user.kycStatus}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-warm-500 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="text-coral-500 hover:text-coral-600 text-sm font-semibold transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-warm-100">
            <p className="text-sm text-warm-500">
              Page {data.page} of {data.totalPages} ({data.total} users)
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

      {/* User detail / edit modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-warm-100">
              <h2 className="font-display text-lg font-bold text-warm-900">Edit User</h2>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-warm-400 hover:text-warm-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-coral-600">
                    {(selectedUser.fullName || '?').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-warm-900">{selectedUser.fullName}</p>
                  <p className="text-warm-500 text-sm">{selectedUser.email ?? selectedUser.phone ?? '—'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">KYC Status</label>
                <select
                  value={editKyc}
                  onChange={(e) => setEditKyc(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-warm-200 bg-white text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-400"
                >
                  {KYC_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-warm-100">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1" isLoading={saving} onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
