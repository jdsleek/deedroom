'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PARTY_ROLE_LABELS } from '@/types'

interface InviteData {
  deal: { title: string; property_address: string; deal_type: string }
  party: { role: string; invite_name: string }
  agentName: string
}

export default function InviteLandingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [data, setData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error)
        setData(res.data)
      })
      .catch((e) => setError(e.message || 'Invalid or expired invite'))
      .finally(() => setLoading(false))
  }, [token])

  const handleOpenDealRoom = () => {
    router.push(`/invite/${token}/auth`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
        <Card className="max-w-md p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-navy-600">Invalid Invite</h1>
          <p className="mt-2 text-navy-400">{error}</p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <Card className="max-w-lg w-full p-8">
        <h1 className="font-display text-2xl font-semibold text-navy-600">
          You&apos;ve been invited to a deal
        </h1>
        <p className="mt-2 text-navy-400">
          {data.agentName} has invited you to review and sign documents.
        </p>

        <div className="mt-6 space-y-3 rounded-lg bg-cream-50 p-4">
          <div>
            <span className="text-xs font-medium text-navy-400">Deal</span>
            <p className="font-medium text-navy-600">{data.deal.title}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-navy-400">Property</span>
            <p className="text-navy-600">{data.deal.property_address}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-navy-400">Your role</span>
            <p className="text-navy-600">{PARTY_ROLE_LABELS[data.party.role as keyof typeof PARTY_ROLE_LABELS] ?? data.party.role}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={handleOpenDealRoom}>
            Review & Sign Documents
          </Button>
          <Link href="/login" className="flex-1">
            <Button variant="outline" className="w-full">
              I have an account
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-navy-400">
          You may need to sign in or create an account to access the deal room.
        </p>
      </Card>
    </div>
  )
}
