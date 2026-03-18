'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck } from 'lucide-react'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', company_name: '' })

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ data }) => {
        setProfile(data)
        if (data) {
          setForm({
            full_name: data.full_name ?? '',
            phone: data.phone ?? '',
            email: data.email ?? session.user?.email ?? '',
            company_name: data.company_name ?? '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone || null,
          company_name: form.company_name || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setMessage('Saved!')
    } catch {
      setMessage('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl font-semibold text-warm-900">Settings</h1>

      {/* Profile section - white card */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-lg font-semibold text-warm-900 mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full name"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+2348012345678"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            disabled
          />
          <Input
            label="Company name"
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            placeholder="Your agency or company"
          />
          {message && (
            <p className={`text-sm ${message === 'Saved!' ? 'text-teal-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </div>

      {/* Verification section */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-coral-500" />
            <h2 className="font-display text-lg font-semibold text-warm-900">Verification</h2>
          </div>
          <Badge
            variant={
              profile?.kyc_status === 'verified'
                ? 'success'
                : profile?.kyc_status === 'submitted'
                  ? 'info'
                  : profile?.kyc_status === 'rejected'
                    ? 'danger'
                    : 'warning'
            }
          >
            {profile?.kyc_status === 'verified'
              ? 'Verified'
              : profile?.kyc_status === 'submitted'
                ? 'Under Review'
                : profile?.kyc_status === 'rejected'
                  ? 'Rejected'
                  : 'Pending'}
          </Badge>
        </div>
        <p className="text-sm text-warm-600 mb-4">
          {profile?.kyc_status === 'verified'
            ? 'Your identity has been verified. You have full access.'
            : 'Complete identity verification to unlock all features.'}
        </p>
        <Link href="/kyc">
          <Button variant="outline" className="border-warm-200 text-warm-700 hover:bg-warm-50">
            {profile?.kyc_status === 'verified' ? 'View verification' : 'Complete verification'}
          </Button>
        </Link>
      </div>

      {/* Sign out section */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-lg font-semibold text-warm-900 mb-2">Account</h2>
        <p className="text-sm text-warm-600 mb-4">
          Sign out of your account on this device.
        </p>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="border-warm-200 text-warm-700 hover:bg-warm-50"
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
