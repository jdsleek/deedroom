'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-navy-600">Settings</h1>
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-navy-600">Profile</h2>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <Input label="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+2348012345678" />
          <Input label="Email" type="email" value={form.email} disabled />
          <Input label="Company name" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} placeholder="Your agency or company" />
          {message && <p className="text-sm text-navy-600">{message}</p>}
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </form>
      </Card>
    </div>
  )
}
