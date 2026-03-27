'use client'

import { useState } from 'react'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import { SignaturePad } from './SignaturePad'
import { OtpModal } from './OtpModal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Document } from '@/types'
import { format } from 'date-fns'

export interface RequiredFields {
  signature: boolean
  initials: boolean
  date: boolean
}

const DEFAULT_REQUIRED_FIELDS: RequiredFields = {
  signature: true,
  initials: true,
  date: true,
}

interface SignatureFlowProps {
  document: Document
  documentUrl: string
  requiredFields?: RequiredFields
  onRequestOtp: () => Promise<{ expiresAt: string }>
  onVerifyAndSign: (otpCode: string, signatureData: string) => Promise<{ verified: boolean; dealCompleted: boolean }>
}

type Step = 'review' | 'sign' | 'verify' | 'done'

export function SignatureFlow({
  document,
  documentUrl,
  requiredFields = DEFAULT_REQUIRED_FIELDS,
  onRequestOtp,
  onVerifyAndSign,
}: SignatureFlowProps) {
  const [step, setStep] = useState<Step>('review')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [initialsData, setInitialsData] = useState<string | null>(null)
  const [signDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [otpModalOpen, setOtpModalOpen] = useState(false)

  const hasSignature = requiredFields.signature ? !!signatureData : true
  const hasInitials = requiredFields.initials ? !!initialsData : true
  const canProceedToVerify = hasSignature && hasInitials

  const handleSignReady = (dataUrl: string) => {
    setSignatureData(dataUrl)
  }

  const handleInitialsReady = (dataUrl: string) => {
    setInitialsData(dataUrl)
  }

  const handleProceedToVerify = () => {
    if (canProceedToVerify) setStep('verify')
  }

  const buildSignaturePayload = (): string => {
    const payload: { signature?: string; initials?: string; date?: string } = {}
    if (requiredFields.signature && signatureData) payload.signature = signatureData
    if (requiredFields.initials && initialsData) payload.initials = initialsData
    if (requiredFields.date) payload.date = signDate
    return JSON.stringify(payload)
  }

  const handleVerifySubmit = async (code: string) => {
    const payload = buildSignaturePayload()
    if (!payload || payload === '{}') return { success: false, error: 'No signature data' }
    const result = await onVerifyAndSign(code, payload)
    if (result.verified) {
      setStep('done')
      setOtpModalOpen(false)
      return { success: true }
    }
    return { success: false, error: 'Invalid code or expired. Please try again.' }
  }

  const handleResendOtp = async () => {
    await onRequestOtp()
  }

  const steps: Step[] = ['review', 'sign', 'verify', 'done']
  const currentIndex = steps.indexOf(step)

  return (
    <div className="space-y-8">
      {/* Step indicator with coral progress */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {steps.map((s, i) => {
          const isActive = step === s
          const isCompleted = currentIndex > i
          return (
            <div key={s} className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isActive && 'bg-coral-500 text-white',
                  isCompleted && 'bg-teal-500 text-white',
                  !isActive && !isCompleted && 'bg-warm-200 text-warm-500'
                )}
              >
                {isCompleted ? '✓' : i + 1}
              </span>
              <span className={cn(
                'text-sm capitalize',
                isActive ? 'font-semibold text-warm-900' : 'text-warm-600'
              )}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 w-6 rounded-full',
                    isCompleted ? 'bg-coral-500' : 'bg-warm-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {step === 'review' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-xl font-semibold text-warm-900 mb-4">Review Document</h3>
            <DocumentViewer documentId={document.id} />
            <Button onClick={() => setStep('sign')} className="mt-4">
              Continue to Sign
            </Button>
          </div>
        </div>
      )}

      {step === 'sign' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs space-y-6">
            <h3 className="font-display text-xl font-semibold text-warm-900">Complete Required Fields</h3>

            {requiredFields.signature && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-teal-700">Signature</h4>
                <SignaturePad
                  label="Draw your signature"
                  onSave={handleSignReady}
                  savedData={signatureData ?? undefined}
                />
              </div>
            )}

            {requiredFields.initials && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-teal-700">Initials</h4>
                <SignaturePad
                  label="Draw your initials"
                  compact
                  onSave={handleInitialsReady}
                  savedData={initialsData ?? undefined}
                />
              </div>
            )}

            {requiredFields.date && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-teal-700">Date</h4>
                <div className="rounded-xl border-2 border-warm-200 bg-warm-50 px-4 py-3 text-warm-800 font-medium">
                  {signDate}
                </div>
                <p className="text-xs text-warm-500">Auto-filled with current date</p>
              </div>
            )}

            <Button
              onClick={handleProceedToVerify}
              disabled={!canProceedToVerify}
              className="mt-4"
            >
              Continue to Verify
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-xl font-semibold text-warm-900 mb-2">Verify & Submit</h3>
            <p className="text-sm text-warm-600 mb-4">
              Your signature is ready. Click below to receive an OTP and complete the signing.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {requiredFields.signature && signatureData && (
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={signatureData}
                    alt="Your signature"
                    className="h-16 rounded-xl border-2 border-warm-200 bg-white"
                  />
                  <span className="text-xs text-warm-500">Signature</span>
                </div>
              )}
              {requiredFields.initials && initialsData && (
                <div className="flex flex-col items-center gap-1">
                  <img
                    src={initialsData}
                    alt="Your initials"
                    className="h-12 rounded-xl border-2 border-warm-200 bg-white"
                  />
                  <span className="text-xs text-warm-500">Initials</span>
                </div>
              )}
              {requiredFields.date && (
                <div className="flex flex-col items-center gap-1">
                  <span className="rounded-xl border-2 border-warm-200 bg-warm-50 px-3 py-2 text-sm font-medium text-warm-800">
                    {signDate}
                  </span>
                  <span className="text-xs text-warm-500">Date</span>
                </div>
              )}
              <Button
                onClick={async () => {
                  try {
                    await onRequestOtp()
                    setOtpModalOpen(true)
                  } catch {
                    // Error handled by parent
                  }
                }}
              >
                Get OTP & Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="rounded-2xl border border-warm-200 bg-white p-12 text-center shadow-xs">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-2xl text-teal-600">
            ✓
          </div>
          <h3 className="font-display text-xl font-semibold text-teal-700">Document Signed</h3>
          <p className="mt-2 text-warm-600">
            Your signature has been recorded with full audit trail.
          </p>
        </div>
      )}

      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onSubmit={handleVerifySubmit}
        onResend={handleResendOtp}
        expiresIn={600}
      />
    </div>
  )
}
