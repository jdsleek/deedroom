'use client'

import { useEffect } from 'react'
import { initCapacitorPlugins, isNativePlatform } from '@/lib/capacitor'

export function CapacitorInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCapacitorPlugins()
    }
  }, [])

  if (!isNativePlatform()) return null

  return (
    <style>{`
      :root {
        --safe-area-top: env(safe-area-inset-top, 0px);
        --safe-area-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-left: env(safe-area-inset-left, 0px);
        --safe-area-right: env(safe-area-inset-right, 0px);
      }
      .pt-safe { padding-top: var(--safe-area-top) !important; }
      .pb-safe { padding-bottom: var(--safe-area-bottom) !important; }
    `}</style>
  )
}
