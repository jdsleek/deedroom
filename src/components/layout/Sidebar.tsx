'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/deals', label: 'Deals', icon: '◈' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-navy-600 flex flex-col shrink-0">
      <div className="p-6 border-b border-navy-500">
        <Link href="/dashboard" className="block">
          <span className="font-display text-xl text-cream-100">DeedRoom</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-navy-300 hover:bg-navy-500/50 hover:text-cream-100'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-navy-500">
        <p className="text-xs text-navy-400">Secure deal rooms for Nigerian real estate</p>
      </div>
    </aside>
  )
}
