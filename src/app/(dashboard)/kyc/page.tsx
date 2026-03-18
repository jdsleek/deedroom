'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ShieldCheck, Upload, Camera, Building2, CheckCircle2 } from 'lucide-react'

const ID_TYPES = [
  { value: 'nin', label: 'National ID (NIN)' },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'international_passport', label: 'International Passport' },
] as const

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  submitted: { label: 'Under Review', variant: 'info' },
  verified: { label: 'Verified', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
}

export default function KycPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [kycStatus, setKycStatus] = useState('pending')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [idType, setIdType] = useState('nin')
  const [idNumber, setIdNumber] = useState('')
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [companyRcNumber, setCompanyRcNumber] = useState('')

  const idFileRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/kyc')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setKycStatus(data.kyc_status)
          const kd = data.kyc_data as Record<string, string> | null
          if (kd) {
            setIdType(kd.id_type || 'nin')
            setIdNumber(kd.id_number || '')
            setCompanyName(kd.company_name || '')
            setCompanyRcNumber(kd.company_rc_number || '')
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idDocument || !selfie) {
      setMessage({ type: 'error', text: 'Please upload both ID document and selfie.' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('id_type', idType)
      fd.append('id_number', idNumber)
      fd.append('id_document', idDocument)
      fd.append('selfie', selfie)
      if (companyName) fd.append('company_name', companyName)
      if (companyRcNumber) fd.append('company_rc_number', companyRcNumber)

      const res = await fetch('/api/kyc', { method: 'PATCH', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed')
      setKycStatus('submitted')
      setMessage({ type: 'success', text: 'KYC documents submitted successfully. We will review within 24-48 hours.' })
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner className="w-8 h-8 text-coral-500" />
      </div>
    )
  }

  const statusConf = STATUS_CONFIG[kycStatus] ?? STATUS_CONFIG.pending
  const isEditable = kycStatus === 'pending' || kycStatus === 'rejected'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50">
            <ShieldCheck className="h-5 w-5 text-coral-500" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-warm-900">Identity Verification</h1>
            <p className="text-sm text-warm-500">Complete KYC to unlock all features</p>
          </div>
        </div>
        <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
      </div>

      {(kycStatus === 'submitted' || kycStatus === 'verified') && (
        <div className={`rounded-2xl border p-5 ${
          kycStatus === 'verified'
            ? 'border-teal-200 bg-teal-50'
            : 'border-blue-200 bg-blue-50'
        }`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`h-5 w-5 mt-0.5 ${
              kycStatus === 'verified' ? 'text-teal-600' : 'text-blue-600'
            }`} />
            <div>
              <p className={`font-semibold text-sm ${
                kycStatus === 'verified' ? 'text-teal-800' : 'text-blue-800'
              }`}>
                {kycStatus === 'verified'
                  ? 'Your identity has been verified'
                  : 'Documents under review'}
              </p>
              <p className={`text-sm mt-1 ${
                kycStatus === 'verified' ? 'text-teal-700' : 'text-blue-700'
              }`}>
                {kycStatus === 'verified'
                  ? 'You have full access to all SignNest features.'
                  : 'We are reviewing your documents. This usually takes 24-48 hours.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditable && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {kycStatus === 'rejected' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-800">Verification was rejected</p>
              <p className="text-sm text-red-700 mt-1">
                Please re-upload your documents and ensure they are clear and valid.
              </p>
            </div>
          )}

          {/* ID Document Section */}
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <Upload className="h-5 w-5 text-coral-500" />
              <h2 className="font-display text-lg font-semibold text-warm-900">ID Document</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-warm-900 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20 transition-colors"
                >
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="ID Number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your ID number"
                required
              />

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">Upload ID Document</label>
                <input
                  ref={idFileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => idFileRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-warm-200 bg-warm-50/50 px-4 py-6 text-center hover:border-coral-300 hover:bg-coral-50/30 transition-colors"
                >
                  {idDocument ? (
                    <span className="text-sm font-medium text-warm-700">{idDocument.name}</span>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-warm-400 mx-auto mb-1.5" />
                      <span className="text-sm text-warm-500">Click to upload ID document</span>
                      <span className="block text-xs text-warm-400 mt-0.5">JPG, PNG or PDF up to 5MB</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selfie Section */}
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <Camera className="h-5 w-5 text-coral-500" />
              <h2 className="font-display text-lg font-semibold text-warm-900">Selfie Verification</h2>
            </div>

            <input
              ref={selfieRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => selfieRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-warm-200 bg-warm-50/50 px-4 py-6 text-center hover:border-coral-300 hover:bg-coral-50/30 transition-colors"
            >
              {selfie ? (
                <span className="text-sm font-medium text-warm-700">{selfie.name}</span>
              ) : (
                <>
                  <Camera className="h-6 w-6 text-warm-400 mx-auto mb-1.5" />
                  <span className="text-sm text-warm-500">Take or upload a selfie</span>
                  <span className="block text-xs text-warm-400 mt-0.5">Clear photo of your face, JPG or PNG</span>
                </>
              )}
            </button>
          </div>

          {/* Company Section (Optional) */}
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1">
              <Building2 className="h-5 w-5 text-coral-500" />
              <h2 className="font-display text-lg font-semibold text-warm-900">Company Information</h2>
            </div>
            <p className="text-sm text-warm-500 mb-4">Optional — for agents and developers</p>

            <div className="space-y-4">
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company or agency name"
              />
              <Input
                label="RC Number"
                value={companyRcNumber}
                onChange={(e) => setCompanyRcNumber(e.target.value)}
                placeholder="CAC registration number"
              />
            </div>
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
            {submitting ? <Spinner className="w-5 h-5" /> : 'Submit for Verification'}
          </Button>
        </form>
      )}
    </div>
  )
}
