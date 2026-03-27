'use client'

import { format } from 'date-fns'
import type { DealParty } from '@/types'

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
  const activeParties = parties.filter((p) => p.status !== 'declined')

  return (
    <div className="space-y-2">
      {activeParties.map((party) => {
        const sr = signatureRequests.find(
          (r) => r.document_id === documentId && r.party_id === party.id
        )
        const signed = !!sr?.signed_at

        return (
          <div
            key={party.id}
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
                    {sr?.signed_at && format(new Date(sr.signed_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </>
              ) : sr ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  In progress
                </span>
              ) : (
                <span className="rounded-full bg-warm-100 px-2.5 py-0.5 text-xs font-semibold text-warm-600">
                  Awaiting
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
