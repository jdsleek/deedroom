'use client'

import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'
import type { DealParty, SignatureRequest } from '@/types'

interface SignatureRequestMinimal {
  id?: string
  document_id: string
  party_id: string
  signed_at: string | null
}

interface SignatureStatusProps {
  parties: DealParty[]
  signatureRequests: SignatureRequestMinimal[]
  documentId: string
}

export function SignatureStatus({ parties, signatureRequests, documentId }: SignatureStatusProps) {
  const requests = signatureRequests.filter((sr) => sr.document_id === documentId)

  return (
    <div className="space-y-2">
      {requests.map((sr) => {
        const party = parties.find((p) => p.id === sr.party_id)
        if (!party) return null
        const signed = !!sr.signed_at

        return (
          <div
            key={sr.id}
            className="flex items-center justify-between py-2 border-b border-cream-200 last:border-0"
          >
            <span className="font-medium text-navy-700">{party.invite_name}</span>
            <div className="flex items-center gap-2">
              {signed ? (
                <>
                  <Badge variant="success">Signed</Badge>
                  <span className="text-xs text-navy-400">
                    {sr.signed_at && format(new Date(sr.signed_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </>
              ) : (
                <Badge variant="secondary">Pending</Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
