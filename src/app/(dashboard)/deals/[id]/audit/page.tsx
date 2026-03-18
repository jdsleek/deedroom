'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AuditTrail } from '@/components/deals/AuditTrail'
import type { AuditLog } from '@/types'

export default function DealAuditPage() {
  const params = useParams()
  const id = params.id as string
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/audit/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setLogs(data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  return <AuditTrail dealId={id} logs={logs} />
}
