'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const poll = useCallback(async () => {
    try {
      const result = await fetcher()
      if (mountedRef.current) {
        setData(result)
        setLoading(false)
      }
    } catch {
      if (mountedRef.current) setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    mountedRef.current = true
    if (!enabled) return
    poll()
    intervalRef.current = setInterval(poll, intervalMs)
    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [poll, intervalMs, enabled])

  const refresh = useCallback(() => { poll() }, [poll])

  return { data, loading, refresh }
}

export function useAutoRefresh(refreshFn: () => void, intervalMs: number, enabled = true) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) return
    intervalRef.current = setInterval(refreshFn, intervalMs)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refreshFn, intervalMs, enabled])
}
