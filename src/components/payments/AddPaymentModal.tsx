'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PAYMENT_METHODS } from '@/types'
import type { Deal } from '@/types'
import { toKobo } from '@/types'

interface AddPaymentModalProps {
  dealId: string
  deal?: Deal | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SuggestedPayment {
  description: string
  amount: number
}

function getSuggestedPayments(deal: Deal): SuggestedPayment[] {
  const items: SuggestedPayment[] = []
  if (deal.deal_type === 'rent' && deal.rent_amount) {
    items.push({ description: `Rent (${deal.rent_period ?? 'annual'})`, amount: deal.rent_amount / 100 })
  }
  if (deal.caution_fee && deal.caution_fee > 0) {
    items.push({ description: 'Caution Fee', amount: deal.caution_fee / 100 })
  }
  if (deal.agency_fee && deal.agency_fee > 0) {
    items.push({ description: 'Agency Fee', amount: deal.agency_fee / 100 })
  }
  if (deal.legal_fee && deal.legal_fee > 0) {
    items.push({ description: 'Legal Fee', amount: deal.legal_fee / 100 })
  }
  if (deal.deal_type === 'sale' && deal.sale_price) {
    items.push({ description: 'Sale Price', amount: deal.sale_price / 100 })
  }
  return items
}

export function AddPaymentModal({ dealId, deal, open, onClose, onSuccess }: AddPaymentModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggested = deal ? getSuggestedPayments(deal) : []

  const reset = () => {
    setDescription('')
    setAmount('')
    setMethod('')
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const fillSuggested = (s: SuggestedPayment) => {
    setDescription(s.description)
    setAmount(String(s.amount))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amountNum = parseFloat(amount)
    if (!description.trim()) {
      setError('Description is required')
      return
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId,
          description: description.trim(),
          amount: toKobo(amountNum),
          method: method || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.fieldErrors ? 'Validation error' : (json.error ?? 'Failed'))
      handleClose()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="Add Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {suggested.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-warm-500">Quick add from deal financials</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
                <button
                  key={s.description}
                  type="button"
                  onClick={() => fillSuggested(s)}
                  className="rounded-full border border-warm-200 bg-warm-50 px-3 py-1.5 text-xs font-medium text-warm-700 transition-colors hover:border-coral-300 hover:bg-coral-50 hover:text-coral-700"
                >
                  {s.description} — ₦{s.amount.toLocaleString('en-NG')}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="e.g. Rent payment, Agency fee"
        />

        <Input
          label="Amount (₦)"
          type="number"
          min={1}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="500,000"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-800">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-warm-800 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
          >
            <option value="">Select method (optional)</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value} disabled={'disabled' in m ? (m as { disabled?: boolean }).disabled : false}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Add Payment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
