'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Handshake,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/deals', label: 'Deals', icon: Handshake },
  { href: '/admin/kyc', label: 'KYC Reviews', icon: ShieldCheck },
  { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
]

interface AdminShellProps {
  children: React.ReactNode
  user?: { name?: string | null; email?: string | null } | null
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.refresh()
    router.push('/login')
  }

  const initials = (user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 px-3 space-y-0.5">
        {adminNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-coral-50 text-coral-600'
                  : 'text-warm-500 hover:bg-warm-50 hover:text-warm-800'
              )}
            >
              <Icon
                className={cn(
                  'h-[20px] w-[20px]',
                  isActive ? 'text-coral-500' : 'text-warm-400'
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-warm-100">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] min-h-screen flex-col bg-white border-r border-warm-200 shrink-0">
        <div className="p-6 pb-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-coral-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">
                S
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-warm-900">
                SignNest
              </span>
              <span className="text-[11px] font-semibold text-coral-500 -mt-0.5 tracking-wide uppercase">
                Admin
              </span>
            </div>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-warm-900/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[280px] max-w-[85vw] bg-white border-r border-warm-200 shadow-xl flex flex-col transition-transform duration-300 ease-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 pb-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-coral-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">
                S
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-warm-900">
                SignNest
              </span>
              <span className="text-[11px] font-semibold text-coral-500 -mt-0.5 tracking-wide uppercase">
                Admin
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-warm-500 hover:bg-warm-100 hover:text-warm-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavContent onNavigate={() => setMobileMenuOpen(false)} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-warm-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="lg:hidden flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-warm-600 hover:bg-warm-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">
                  S
                </span>
              </div>
              <span className="font-display text-lg font-bold text-warm-900">
                SignNest Admin
              </span>
            </div>
          </div>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-coral-600">
                    {initials}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-warm-700">
                  {user.name ?? user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-warm-400 hover:text-warm-600 transition-colors p-1.5 rounded-lg hover:bg-warm-50"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
