import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DealCard } from '@/components/deals/DealCard'
import { serializeDeal } from '@/lib/serialize'
import type { DealParty, Document } from '@/types'
import { Plus } from 'lucide-react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) redirect('/login?redirectTo=/dashboard')

  const deals = await prisma.deal.findMany({
    where: {
      OR: [
        { createdById: userId },
        { parties: { some: { userId } } },
      ],
    },
    include: {
      parties: true,
      documents: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const allDeals = deals.map((d) => ({
    ...serializeDeal(d),
    parties: d.parties.map((p) => ({
      id: p.id,
      status: p.status,
      invite_name: p.inviteName,
      role: p.role,
      invite_phone: p.invitePhone,
      invite_email: p.inviteEmail,
      invite_token: p.inviteToken,
      deal_id: p.dealId,
      user_id: p.userId,
      invited_at: p.invitedAt.toISOString(),
      viewed_at: p.viewedAt?.toISOString() ?? null,
      signed_at: p.signedAt?.toISOString() ?? null,
      declined_at: p.declinedAt?.toISOString() ?? null,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    })),
    documents: d.documents,
  }))
  const activeDeals = allDeals.filter((d) => !['completed', 'cancelled'].includes(d.status))
  const completedThisMonth = allDeals.filter((d) => {
    if (d.status !== 'completed' || !d.completed_at) return false
    const d2 = new Date(d.completed_at)
    const now = new Date()
    return d2.getMonth() === now.getMonth() && d2.getFullYear() === now.getFullYear()
  })
  const pendingSignatures = allDeals.filter((d) => d.status === 'signing')
  const totalParties = allDeals.reduce((acc, d) => acc + (d.parties?.length ?? 0), 0)

  const name = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'there'
  const greeting = getGreeting()

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-500">
            Hello, {name}
          </h1>
          <p className="text-warm-500 text-sm mt-1">Here&apos;s your deal overview</p>
        </div>
        <Link href="/settings" className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center">
          <span className="text-sm font-bold text-coral-700">
            {(session?.user?.name ?? session?.user?.email ?? 'U').slice(0, 2).toUpperCase()}
          </span>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <Link href="/deals/new" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-warm-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-coral-500 flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-warm-700 text-center">New Deal</span>
        </Link>
        <Link href="/templates" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-warm-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-coral-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="text-xs font-medium text-warm-700 text-center">Templates</span>
        </Link>
        <Link href="/deals" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-warm-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-coral-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <span className="text-xs font-medium text-warm-700 text-center">Documents</span>
        </Link>
        <Link href="/deals" className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-warm-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-coral-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <span className="text-xs font-medium text-warm-700 text-center">Audit Trail</span>
        </Link>
      </div>

      {allDeals.length === 0 ? (
        <div className="rounded-2xl border border-warm-200 bg-white p-12 text-center shadow-xs">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-coral-50 flex items-center justify-center">
              <span className="text-3xl" aria-hidden>📄</span>
            </div>
            <h2 className="font-display text-xl font-bold text-navy-500">No deals yet</h2>
            <p className="text-warm-500 text-sm mt-2">
              Create your first deal room to invite parties, share documents, and collect signatures.
            </p>
            <Link href="/deals/new" className="inline-block mt-6">
              <Button variant="primary" className="rounded-xl">
                New Deal +
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
            <div className="flex-shrink-0 w-[160px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-xs">Active Deals</p>
              <p className="text-2xl font-display font-bold text-navy-500 mt-1">{activeDeals.length}</p>
            </div>
            <div className="flex-shrink-0 w-[160px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-xs">Closed This Month</p>
              <p className="text-2xl font-display font-bold text-navy-500 mt-1">{completedThisMonth.length}</p>
            </div>
            <div className="flex-shrink-0 w-[160px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-xs">Pending Signatures</p>
              <p className="text-2xl font-display font-bold text-navy-500 mt-1">{pendingSignatures.length}</p>
            </div>
            <div className="flex-shrink-0 w-[160px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-xs">Total Parties</p>
              <p className="text-2xl font-display font-bold text-navy-500 mt-1">{totalParties}</p>
            </div>
          </div>

          {/* Active Deals */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-500">Active Deals</h2>
            <Link href="/deals" className="text-sm font-medium text-coral-500 hover:text-coral-600">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {allDeals.slice(0, 5).map((deal) => (
              <DealCard
                key={deal.id}
                deal={{
                  ...deal,
                  parties: deal.parties as DealParty[],
                  documents: deal.documents as Document[],
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
