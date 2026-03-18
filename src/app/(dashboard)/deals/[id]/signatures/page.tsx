'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SignatureStatus } from '@/components/signatures/SignatureStatus'
import { SignatureFlow } from '@/components/signatures/SignatureFlow'
import { Button } from '@/components/ui/Button'
import type { Deal, DealParty, Document, RequiredFields, SignatureRequest } from '@/types'

interface SignatureRequestMinimal {
  id?: string
  document_id: string
  party_id: string
  signed_at: string | null
}

function canPartySign(
  party: DealParty,
  allParties: DealParty[],
  signatureRequests: SignatureRequestMinimal[],
  documents: Document[],
): { allowed: boolean; reason?: string } {
  if (party.sign_order == null) return { allowed: true }

  const partiesWithLowerOrder = allParties.filter(
    (p) => p.sign_order != null && p.sign_order < party.sign_order!
  )

  for (const prior of partiesWithLowerOrder) {
    const allDocsSigned = documents.every((doc) => {
      const req = signatureRequests.find(
        (sr) => sr.document_id === doc.id && sr.party_id === prior.id
      )
      return req?.signed_at != null
    })

    if (!allDocsSigned) {
      return {
        allowed: false,
        reason: `Waiting for ${prior.invite_name} (order ${prior.sign_order}) to finish signing all documents`,
      }
    }
  }

  return { allowed: true }
}

export default function DealSignaturesPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const currentUserId = (session?.user as { id?: string })?.id

  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [sigRequestId, setSigRequestId] = useState<string | null>(null)
  const [creatingRequest, setCreatingRequest] = useState(false)

  const fetchDeal = useCallback(() => {
    fetch(`/api/deals/${id}`)
      .then((r) => r.json())
      .then(({ data }) => setDeal(data))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchDeal()
  }, [fetchDeal])

  if (loading || !deal) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  const parties: DealParty[] =
    (deal as { deal_parties?: DealParty[] }).deal_parties ?? deal.parties ?? []
  const documents: Document[] = deal.documents ?? []
  const signatureRequests: SignatureRequestMinimal[] =
    (deal as { signature_requests?: SignatureRequestMinimal[] }).signature_requests ?? []

  const currentParty = parties.find((p) => p.user_id === currentUserId) ?? null
  const isCreator = deal.created_by === currentUserId
  const [partyFieldReqs, setPartyFieldReqs] = useState<Record<string, RequiredFields>>({})

  const getRequiredFields = useCallback((partyId: string): RequiredFields => {
    const rf = partyFieldReqs[partyId] ?? (parties.find((p) => p.id === partyId) as DealParty & { required_fields?: RequiredFields })?.required_fields ?? {
      signature: true,
      initials: true,
      date: true,
    }
    if (!rf.signature && !rf.initials && !rf.date) {
      return { signature: true, initials: true, date: true }
    }
    return rf
  }, [partyFieldReqs, parties])

  const handlePartyFieldsChange = useCallback(async (partyId: string, fields: RequiredFields) => {
    setPartyFieldReqs((prev) => ({ ...prev, [partyId]: fields }))
    try {
      await fetch(`/api/parties/${partyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          required_fields: {
            signature: fields.signature,
            initials: fields.initials,
            date: fields.date,
          },
        }),
      })
    } catch {
      setPartyFieldReqs((prev) => {
        const next = { ...prev }
        delete next[partyId]
        return next
      })
    }
  }, [])

  const signOrderCheck = currentParty
    ? canPartySign(currentParty, parties, signatureRequests, documents)
    : { allowed: false, reason: 'You are not a party to this deal' }

  const handleSignNow = async (doc: Document) => {
    if (!currentParty) return
    setCreatingRequest(true)
    try {
      const res = await fetch('/api/signatures/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: id,
          document_id: doc.id,
          party_id: currentParty.id,
        }),
      })
      const json = await res.json()
      if (json.data?.id) {
        setSigRequestId(json.data.id)
        setActiveDocId(doc.id)
      }
    } catch {
      // ignore
    } finally {
      setCreatingRequest(false)
    }
  }

  const handleRequestOtp = async (): Promise<{ expiresAt: string }> => {
    const res = await fetch('/api/signatures/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature_request_id: sigRequestId }),
    })
    const json = await res.json()
    return { expiresAt: json.data?.expires_at ?? '' }
  }

  const handleVerifyAndSign = async (
    otpCode: string,
    signatureData: string,
  ): Promise<{ verified: boolean; dealCompleted: boolean }> => {
    const res = await fetch('/api/signatures/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature_request_id: sigRequestId,
        otp_code: otpCode,
        signature_data: signatureData,
      }),
    })
    const json = await res.json()
    const verified = json.data?.verified ?? false
    if (verified) {
      setActiveDocId(null)
      setSigRequestId(null)
      fetchDeal()
    }
    return { verified, dealCompleted: json.data?.deal_completed ?? false }
  }

  const hasDocumentBeenSigned = (docId: string) => {
    if (!currentParty) return false
    const req = signatureRequests.find(
      (sr) => sr.document_id === docId && sr.party_id === currentParty.id,
    )
    return req?.signed_at != null
  }

  return (
    <div className="space-y-6">
      <p className="text-warm-600">
        {documents.length === 0
          ? 'Upload documents first to collect signatures.'
          : `Signing status for ${documents.length} document(s).`}
      </p>

      {isCreator && parties.length > 0 && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/30 p-6">
          <h3 className="font-display text-lg font-semibold text-warm-900 mb-4">Field Requirements per Party</h3>
          <p className="text-sm text-warm-600 mb-4">
            Choose which fields each party must complete when signing. Default: all three.
          </p>
          <div className="space-y-4">
            {parties.map((party) => (
              <div key={party.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-teal-100 bg-white p-4">
                <span className="font-medium text-warm-800 min-w-[140px]">{party.invite_name}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getRequiredFields(party.id).signature}
                    onChange={(e) => handlePartyFieldsChange(party.id, { ...getRequiredFields(party.id), signature: e.target.checked })}
                    className="rounded border-warm-300 text-coral-500 focus:ring-coral-500"
                  />
                  <span className="text-sm text-warm-700">Signature required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getRequiredFields(party.id).initials}
                    onChange={(e) => handlePartyFieldsChange(party.id, { ...getRequiredFields(party.id), initials: e.target.checked })}
                    className="rounded border-warm-300 text-coral-500 focus:ring-coral-500"
                  />
                  <span className="text-sm text-warm-700">Initials required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getRequiredFields(party.id).date}
                    onChange={(e) => handlePartyFieldsChange(party.id, { ...getRequiredFields(party.id), date: e.target.checked })}
                    className="rounded border-warm-300 text-coral-500 focus:ring-coral-500"
                  />
                  <span className="text-sm text-warm-700">Date required</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentParty && !signOrderCheck.allowed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⏳</span>
            <p className="text-sm font-medium text-amber-800">
              {signOrderCheck.reason}
            </p>
          </div>
        </div>
      )}

      {currentParty && signOrderCheck.allowed && currentParty.sign_order != null && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-teal-600">✓</span>
            <p className="text-sm font-medium text-teal-800">
              It's your turn to sign (order {currentParty.sign_order})
            </p>
          </div>
        </div>
      )}

      {documents.map((doc) => {
        const signed = hasDocumentBeenSigned(doc.id)
        const isActive = activeDocId === doc.id
        const showSignButton =
          currentParty && !signed && signOrderCheck.allowed && !isActive

        return (
          <div key={doc.id} className="space-y-0">
            <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-warm-800">
                  {doc.name}
                </h3>
                {signed && (
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    You signed
                  </span>
                )}
              </div>

              <SignatureStatus
                parties={parties}
                signatureRequests={signatureRequests}
                documentId={doc.id}
              />

              {showSignButton && (
                <div className="mt-4 pt-4 border-t border-warm-200">
                  <Button
                    onClick={() => handleSignNow(doc)}
                    disabled={creatingRequest}
                  >
                    {creatingRequest ? 'Preparing...' : 'Sign Now'}
                  </Button>
                </div>
              )}
            </div>

            {isActive && sigRequestId && (
              <div className="mt-4 rounded-2xl border border-coral-200 bg-coral-50/30 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-display text-lg font-semibold text-warm-900">
                    Signing: {doc.name}
                  </h4>
                  <button
                    onClick={() => {
                      setActiveDocId(null)
                      setSigRequestId(null)
                    }}
                    className="text-sm text-warm-500 hover:text-warm-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <SignatureFlow
                  document={doc}
                  documentUrl={doc.file_path}
                  requiredFields={currentParty ? getRequiredFields(currentParty.id) : undefined}
                  onRequestOtp={handleRequestOtp}
                  onVerifyAndSign={handleVerifyAndSign}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
