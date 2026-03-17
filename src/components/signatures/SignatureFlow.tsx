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

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        {(['review', 'sign', 'verify', 'done'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={cn(
              'flex items-center gap-2',
              step === s && 'text-gold-600 font-medium'
            )}
          >
            <span
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                step === s
                  ? 'bg-gold-500 text-white'
                  : ['review', 'sign', 'verify', 'done'].indexOf(step) > i
                    ? 'bg-emerald-500 text-white'
                    : 'bg-cream-300 text-navy-400'
              )}
            >
              {['review', 'sign', 'verify', 'done'].indexOf(step) > i ? '✓' : i + 1}
            </span>
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>

      {step === 'review' && (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-navy-700">Review Document</h3>
          <DocumentViewer url={documentUrl} name={document.name} />
          <Button onClick={() => setStep('sign')}>Continue to Sign</Button>
        </div>
      )}

      {step === 'sign' && (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-navy-700">Draw Your Signature</h3>
          <SignaturePad onSave={handleSignReady} savedData={signatureData ?? undefined} />
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <h3 className="font-display text-xl text-navy-700">Verify & Submit</h3>
          <p className="text-navy-400 text-sm">
            Your signature is ready. Click below to receive an OTP and complete the signing.
          </p>
          {signatureData && (
            <div className="flex items-center gap-4">
              <img
                src={signatureData}
                alt="Your signature"
                className="h-16 border border-cream-300 rounded"
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
      )}

      {step === 'done' && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="font-display text-xl text-emerald-700">Document Signed</h3>
          <p className="text-navy-400 mt-2">
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
