'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface OtpModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (code: string) => Promise<{ success: boolean; error?: string }>
  onResend: () => Promise<void>
  expiresIn?: number
  channel?: 'sms' | 'whatsapp'
}

export function OtpModal({
  isOpen,
  onClose,
  onSubmit,
  onResend,
  expiresIn = 600,
  channel = 'whatsapp',
}: OtpModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [timeLeft, setTimeLeft] = useState(expiresIn)

  const inputRefs = [0, 1, 2, 3, 4, 5].map(() => useRef<HTMLInputElement>(null))

  useEffect(() => {
    if (!isOpen) return
    setDigits(['', '', '', '', '', ''])
    setError(null)
    setTimeLeft(expiresIn)
    setResendCooldown(60)
    inputRefs[0]?.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      if (value && !/^\d$/.test(value)) return
      const newDigits = [...digits]
      newDigits[index] = value
      setDigits(newDigits)
      setError(null)
      if (value && index < 5) {
        inputRefs[index + 1]?.current?.focus()
      }
    },
    [digits]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs[index - 1]?.current?.focus()
      }
    },
    [digits]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      const newDigits = [...digits]
      pasted.split('').forEach((char, i) => {
        newDigits[i] = char
      })
      setDigits(newDigits)
      if (pasted.length > 0) {
        inputRefs[Math.min(pasted.length, 5)]?.current?.focus()
      }
    },
    [digits]
  )

  const code = digits.join('')

  const handleSubmit = useCallback(async () => {
    if (code.length !== 6) {
      setError('Enter all 6 digits')
      return
    }
    setLoading(true)
    setError(null)
    const result = await onSubmit(code)
    setLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error ?? 'Invalid code. Please try again.')
      setDigits(['', '', '', '', '', ''])
      inputRefs[0]?.current?.focus()
    }
  }, [code, onSubmit, onClose])

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    await onResend()
    setResendCooldown(60)
    setTimeLeft(600)
    setDigits(['', '', '', '', '', ''])
    setLoading(false)
    inputRefs[0]?.current?.focus()
  }, [resendCooldown, onResend])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify with OTP">
      <div className="space-y-6">
        <p className="text-navy-400 text-sm">
          We sent a 6-digit code to your phone via {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.
        </p>
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-semibold border-2 border-cream-300 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none"
            />
          ))}
        </div>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <div className="text-center text-sm text-navy-400">
          Code expires in {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={handleSubmit} disabled={loading || code.length !== 6} className="w-full">
            {loading ? 'Verifying...' : 'Verify & Sign'}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className={cn(
              'text-sm',
              resendCooldown > 0 ? 'text-navy-300' : 'text-gold-600 hover:text-gold-700'
            )}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend code'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
