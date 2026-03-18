'use client'

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
            className="flex items-center justify-between border-b border-warm-200 py-2 last:border-0"
          >
            <span className="font-medium text-warm-800">{party.invite_name}</span>
            <div className="flex items-center gap-2">
              {signed ? (
                <>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                    Signed
                  </span>
                  <span className="text-xs text-warm-500">
                    {sr.signed_at && format(new Date(sr.signed_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-warm-100 px-2.5 py-0.5 text-xs font-semibold text-warm-600">
                  Pending
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
