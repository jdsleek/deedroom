'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

  return (
    <header className="h-16 bg-white border-b border-cream-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-navy-400">{user.name ?? user.email ?? 'User'}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-navy-400 hover:text-navy-600"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  )
}
