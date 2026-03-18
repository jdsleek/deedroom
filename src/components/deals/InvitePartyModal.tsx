'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PARTY_ROLE_LABELS } from '@/types'
import type { PartyRole } from '@/types'

interface InvitePartyModalProps {
  dealId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ROLES: PartyRole[] = ['landlord', 'tenant', 'buyer', 'agent', 'developer', 'lawyer']

export function InvitePartyModal({ dealId, open, onClose, onSuccess }: InvitePartyModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PartyRole>('tenant')
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setPhone('')
    setEmail('')
    setRole('tenant')
    setError(null)
    setInviteLink(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      setError('Name and either phone or email are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          role,
          invite_name: name.trim(),
          invite_phone: phone.trim() || null,
          invite_email: email.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to invite')
      setInviteLink(json.data?.invite_link ?? null)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite party')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Invite Party">
      {inviteLink ? (
        <div className="space-y-4">
          <p className="text-sm text-navy-600">Invitation sent. Share this link:</p>
          <div className="rounded-lg bg-cream-100 p-3 text-sm text-navy-600 break-all">
            {inviteLink}
          </div>
          <Button onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />
          <Input
            label="Phone (for WhatsApp/SMS)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 801 234 5678"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PartyRole)}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-navy-600 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {PARTY_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">Send invite via</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="channel"
                  checked={channel === 'whatsapp'}
                  onChange={() => setChannel('whatsapp')}
                />
                <span className="text-sm">WhatsApp</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="channel"
                  checked={channel === 'sms'}
                  onChange={() => setChannel('sms')}
                />
                <span className="text-sm">SMS</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
