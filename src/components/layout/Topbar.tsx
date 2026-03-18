'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface TopbarProps {
  user?: { name?: string | null; email?: string | null } | null
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.refresh()
    router.push('/login')
  }

  const initials = (user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()

  return (
    <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-warm-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="lg:hidden flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">S</span>
        </div>
        <span className="font-display text-lg font-bold text-warm-900">SignNest</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
              <span className="text-xs font-bold text-coral-600">{initials}</span>
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
  )
}
