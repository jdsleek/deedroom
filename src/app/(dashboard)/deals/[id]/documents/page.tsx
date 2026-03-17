'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DocumentVault } from '@/components/documents/DocumentVault'
import type { Deal, Document as DocumentType } from '@/types'

export default function DealDocumentsPage() {
  const params = useParams()
  const id = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setDeal(data))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [id])

  const refreshDeal = () => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setDeal(data))
  }

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <DocumentVault
      dealId={deal.id}
      documents={(deal.documents ?? []) as DocumentType[]}
      canManage={deal.status !== 'completed' && deal.status !== 'cancelled'}
      onRefresh={refreshDeal}
    />
  )
}
