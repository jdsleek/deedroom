'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { phoneToE164 } from '@/lib/utils'

export default function InviteAuthPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [step, setStep] = useState<'check' | 'register' | 'otp'>('check')
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [partyId, setPartyId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        linkAndRedirect(session.user.id)
      } else {
        setLoading(false)
        setStep('register')
      }
    })
  }, [])

  async function linkAndRedirect(userId: string) {
    const res = await fetch(`/api/invites/${token}`)
    const { data } = await res.json()
    if (!data?.partyId) {
      setError('Invalid invite')
      return
    }
    await fetch(`/api/parties/${data.partyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    router.push(`/deals/${data.dealId}?welcome=1`)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const normalized = phoneToE164(phone)
    if (!normalized) {
      setError('Invalid phone number')
      return
    }
    setLoading(true)
    const { error: signUpError } = await supabase.auth.signInWithOtp({
      phone: normalized,
      options: { data: { full_name: name } },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }
    setStep('otp')
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data: { user }, error: verifyError } = await supabase.auth.verifyOtp({
      phone: phoneToE164(phone)!,
      token: otp,
      type: 'sms',
    })
    if (verifyError || !user) {
      setError(verifyError?.message ?? 'Invalid code')
      setLoading(false)
      return
    }
    await linkAndRedirect(user.id)
    setLoading(false)
  }

  if (step === 'register') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
        <Card className="max-w-md w-full p-8">
          <h1 className="font-display text-xl font-semibold text-navy-600">Create account</h1>
          <p className="mt-2 text-sm text-navy-400">Enter your details to access the deal room.</p>
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
            <Input
              label="Phone (with country code)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+2348012345678"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Continue'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-navy-400">
            <Link href="/login" className="text-gold-600 hover:underline">Already have an account?</Link>
          </p>
        </Card>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
        <Card className="max-w-md w-full p-8">
          <h1 className="font-display text-xl font-semibold text-navy-600">Verify your phone</h1>
          <p className="mt-2 text-sm text-navy-400">Enter the code sent to {phone}</p>
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <Input
              label="Verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="123456"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
    </div>
  )
}
