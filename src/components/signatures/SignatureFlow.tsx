'use client'

import { useState } from 'react'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import { SignaturePad } from './SignaturePad'
import { OtpModal } from './OtpModal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Document } from '@/types'

interface SignatureFlowProps {
  document: Document
  documentUrl: string
  onRequestOtp: () => Promise<{ expiresAt: string }>
  onVerifyAndSign: (otpCode: string, signatureData: string) => Promise<{ verified: boolean; dealCompleted: boolean }>
}

type Step = 'review' | 'sign' | 'verify' | 'done'

export function SignatureFlow({
  document,
  documentUrl,
  onRequestOtp,
  onVerifyAndSign,
}: SignatureFlowProps) {
  const [step, setStep] = useState<Step>('review')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [otpModalOpen, setOtpModalOpen] = useState(false)

  const handleSignReady = (dataUrl: string) => {
    setSignatureData(dataUrl)
    setStep('verify')
  }

  const handleVerifySubmit = async (code: string) => {
    if (!signatureData) return { success: false, error: 'No signature' }
    const result = await onVerifyAndSign(code, signatureData)
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
          <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-xl font-semibold text-warm-900 mb-4">Draw Your Signature</h3>
            <SignaturePad onSave={handleSignReady} savedData={signatureData ?? undefined} />
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
            {signatureData && (
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={signatureData}
                  alt="Your signature"
                  className="h-16 rounded-xl border-2 border-warm-200 bg-white"
                />
                <Button
                  onClick={() => {
                    setOtpModalOpen(true)
                    onRequestOtp()
                  }}
                >
                  Get OTP & Complete
                </Button>
              </div>
            )}
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
