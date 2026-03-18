'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Handshake, ShieldCheck, ArrowLeft } from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/deals', label: 'Deals', icon: Handshake },
  { href: '/admin/kyc', label: 'KYC Reviews', icon: ShieldCheck },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-[260px] min-h-screen flex-col bg-white border-r border-warm-200 shrink-0">
      <div className="p-6 pb-4">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-coral-500 flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-warm-900">SignNest</span>
            <span className="text-[11px] font-semibold text-coral-500 -mt-0.5 tracking-wide uppercase">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
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
      </nav>

      <div className="p-4 border-t border-warm-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </aside>
  )
}
