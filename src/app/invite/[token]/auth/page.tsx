'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SignNestLogo } from '@/components/brand/SignNestLogo'

export default function InviteAuthPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { data: session, status } = useSession()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      linkAndRedirect()
    }
  }, [status])

  async function linkAndRedirect() {
    const res = await fetch(`/api/invites/${token}`)
    const { data } = await res.json()
    if (!data?.partyId) {
      setError('Invalid invite')
      return
    }
    const userId = (session?.user as { id?: string })?.id
    if (userId) {
      await fetch(`/api/parties/${data.partyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
    }
    router.push(`/deals/${data.dealId}?welcome=1`)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Registration failed')

      const signInRes = await signIn('credentials', { email, password, redirect: false })
      if (signInRes?.error) throw new Error('Login failed after registration')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) throw new Error('Invalid email or password')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <Card className="max-w-md w-full p-8">
        <div className="mb-6 flex justify-center rounded-xl bg-black p-4 -mx-2">
          <SignNestLogo size="md" className="max-w-[180px]" />
        </div>
        <h1 className="font-display text-xl font-semibold text-navy-600">
          {mode === 'register' ? 'Create account' : 'Sign in'}
        </h1>
        <p className="mt-2 text-sm text-navy-400">
          {mode === 'register'
            ? 'Create an account to access the deal room.'
            : 'Sign in to access the deal room.'}
        </p>
        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="mt-6 space-y-4">
          {mode === 'register' && (
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
            minLength={mode === 'register' ? 6 : undefined}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-navy-400">
          {mode === 'register' ? (
            <>Already have an account? <button onClick={() => setMode('login')} className="text-gold-600 hover:underline">Sign in</button></>
          ) : (
            <>Need an account? <button onClick={() => setMode('register')} className="text-gold-600 hover:underline">Register</button></>
          )}
        </p>
      </Card>
    </div>
  )
}
