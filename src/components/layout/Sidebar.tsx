'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Handshake, ShieldCheck, Settings, Shield } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/kyc', label: 'Verification', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-[260px] min-h-screen flex-col bg-white border-r border-warm-200 shrink-0">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-coral-500 flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <span className="font-display text-xl font-bold text-warm-900">SignNest</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-coral-50 text-coral-600'
                  : 'text-warm-500 hover:bg-warm-50 hover:text-warm-800'
              )}
            >
              <Icon className={cn('h-[20px] w-[20px]', isActive ? 'text-coral-500' : 'text-warm-400')} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-warm-100">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150',
              pathname.startsWith('/admin')
                ? 'bg-coral-50 text-coral-600'
                : 'text-warm-500 hover:bg-warm-50 hover:text-warm-800'
            )}
          >
            <Shield className={cn('h-[20px] w-[20px]', pathname.startsWith('/admin') ? 'text-coral-500' : 'text-warm-400')} />
            <span>Admin</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-warm-100">
        <p className="text-xs text-warm-400">Close deals. Collect signatures.</p>
      </div>
    </aside>
  )
}
