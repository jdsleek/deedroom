'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'
import { SignNestLogo } from '@/components/brand/SignNestLogo'
import { useEffect, useState, useRef, useCallback } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: string
}

interface TopbarProps {
  user?: { name?: string | null; email?: string | null } | null
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.status === 401) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.data ?? [])
        setUnreadCount(json.unreadCount ?? 0)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, fetchNotifications])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.refresh()
    router.push('/login')
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
      })
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    if (n.link) {
      setShowDropdown(false)
      router.push(n.link)
    }
  }

  const initials = (user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <header className="bg-navy-500 border-b border-navy-600 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
      <div className="lg:hidden flex items-center">
        <SignNestLogo size="md" />
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-coral-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-warm-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-warm-100">
                    <h3 className="font-display font-semibold text-sm text-warm-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-coral-500 hover:text-coral-600 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-warm-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left px-4 py-3 border-b border-warm-50 hover:bg-warm-50/50 transition-colors ${
                            !n.read ? 'bg-coral-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!n.read && (
                              <span className="mt-1.5 w-2 h-2 rounded-full bg-coral-500 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-warm-800 truncate">{n.title}</p>
                              <p className="text-xs text-warm-500 line-clamp-2 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-warm-400 mt-1">{timeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-white/80">
              {user.name ?? user.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
