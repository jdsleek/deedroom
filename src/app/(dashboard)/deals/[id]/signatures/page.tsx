'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SignatureStatus } from '@/components/signatures/SignatureStatus'
import type { Deal, SignatureRequest } from '@/types'

export default function DealSignaturesPage() {
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

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  const parties = (deal as { deal_parties?: typeof deal.parties }).deal_parties ?? deal.parties ?? []
  const documents = deal.documents ?? []
  const signatureRequests = (deal as { signature_requests?: { document_id: string; party_id: string; signed_at: string | null }[] }).signature_requests ?? []

  return (
    <div className="space-y-6">
      <p className="text-navy-600">
        {documents.length === 0 ? 'Upload documents first to collect signatures.' : `Signing status for ${documents.length} document(s).`}
      </p>
      {documents.map((doc) => (
        <div key={doc.id} className="rounded-lg border border-cream-200 p-4 bg-cream-50">
          <h3 className="font-display font-semibold text-navy-600 mb-3">{doc.name}</h3>
          <SignatureStatus
            parties={parties}
            signatureRequests={signatureRequests}
            documentId={doc.id}
          />
        </div>
      ))}
    </div>
  )
}
