'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateDealWizard } from '@/components/deals/CreateDealWizard'
import { PageHeader } from '@/components/layout/PageHeader'

export default function NewDealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create deal')
      router.push(`/deals/${json.data.id}?welcome=true`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Deal" subtitle="Set up a new transaction room" />
      <CreateDealWizard onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
