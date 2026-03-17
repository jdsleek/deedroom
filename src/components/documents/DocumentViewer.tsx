'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'

interface DocumentViewerProps {
  documentId: string
  className?: string
}

export function DocumentViewer({ documentId, className }: DocumentViewerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchUrl() {
      try {
        const res = await fetch(`/api/documents/${documentId}`)
        const { data } = await res.json()
        if (!res.ok || !data?.url) throw new Error('Failed to load document')
        if (!cancelled) setUrl(data.url)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchUrl()
    return () => { cancelled = true }
  }, [documentId])

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className ?? ''}`}>
        <Spinner />
      </div>
    )
  }

  if (error || !url) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] text-red-600 ${className ?? ''}`}>
        {error ?? 'Document unavailable'}
      </div>
    )
  }

  return (
    <iframe
      src={url}
      className={`w-full min-h-[600px] rounded-lg border border-navy-200 ${className ?? ''}`}
      title="Document viewer"
    />
  )
}
