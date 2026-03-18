'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Handshake, FileText, User } from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/settings', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-200 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors',
                isActive ? 'text-coral-500' : 'text-warm-400'
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={cn('text-[11px]', isActive ? 'font-semibold' : 'font-medium')}>
                {tab.label}
              </span>
              {isActive && <div className="w-4 h-[3px] rounded-full bg-coral-500 mt-0.5" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
