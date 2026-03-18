'use client'

import { useEffect, useState } from 'react'
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
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      .catch(() => setIsAdmin(false))
  }, [])

  return (
    <aside className="hidden lg:flex w-[260px] min-h-screen flex-col bg-navy-500 shrink-0">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-coral-500 flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <span className="font-display text-xl font-bold text-white">SignNest</span>
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
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              )}
            >
              <Icon className={cn('h-[20px] w-[20px]', isActive ? 'text-coral-400' : 'text-white/50')} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150',
                pathname.startsWith('/admin')
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              )}
            >
              <Shield className={cn('h-[20px] w-[20px]', pathname.startsWith('/admin') ? 'text-coral-400' : 'text-white/50')} />
              <span>Admin</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/40">Close property deals. Collect signatures.</p>
      </div>
    </aside>
  )
}
