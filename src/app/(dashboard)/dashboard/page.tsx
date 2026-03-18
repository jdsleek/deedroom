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
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-warm-900">
          {greeting}, {name}
        </h1>
        <p className="text-warm-500 text-sm mt-1">Here&apos;s your deal overview</p>
      </div>

      {allDeals.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-warm-200 bg-white p-12 text-center shadow-xs">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-coral-50 flex items-center justify-center">
              <span className="text-3xl" aria-hidden>📄</span>
            </div>
            <h2 className="font-display text-xl font-bold text-warm-900">No deals yet</h2>
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
            <div className="flex-shrink-0 w-[200px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-sm">Active Deals</p>
              <p className="text-2xl font-display font-bold text-warm-900 mt-1">{activeDeals.length}</p>
            </div>
            <div className="flex-shrink-0 w-[200px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-sm">Closed This Month</p>
              <p className="text-2xl font-display font-bold text-warm-900 mt-1">{completedThisMonth.length}</p>
            </div>
            <div className="flex-shrink-0 w-[200px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-sm">Pending Signatures</p>
              <p className="text-2xl font-display font-bold text-warm-900 mt-1">{pendingSignatures.length}</p>
            </div>
            <div className="flex-shrink-0 w-[200px] lg:w-auto rounded-2xl border border-warm-200 bg-white p-4 shadow-xs">
              <p className="text-warm-500 text-sm">Total Parties</p>
              <p className="text-2xl font-display font-bold text-warm-900 mt-1">{totalParties}</p>
            </div>
          </div>

          {/* Recent Deals */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-warm-900">Recent Deals</h2>
            <Link href="/deals/new" className="hidden lg:block">
              <Button variant="primary" className="rounded-xl">
                New Deal +
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
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

      {/* Mobile FAB */}
      <Link
        href="/deals/new"
        className="fixed bottom-20 right-4 lg:hidden z-50 flex items-center justify-center w-14 h-14 rounded-full bg-coral-500 text-white shadow-lg hover:bg-coral-600 active:scale-95 transition-all"
        aria-label="New Deal"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
