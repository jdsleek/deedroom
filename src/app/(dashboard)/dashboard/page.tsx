import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DealCard } from '@/components/deals/DealCard'
import { serializeDeal } from '@/lib/serialize'
import type { DealParty, Document } from '@/types'

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-navy-600">Dashboard</h1>
        <p className="text-navy-400 mt-1">Welcome back. Here&apos;s your deal overview.</p>
      </div>

      {allDeals.length === 0 ? (
        <div className="bg-cream-200 rounded-xl p-12 text-center">
          <h2 className="font-display text-xl text-navy-600">No deals yet</h2>
          <p className="text-navy-400 mt-2 max-w-md mx-auto">
            Create your first deal room to invite parties, share documents, and collect signatures.
          </p>
          <Link href="/deals/new">
            <Button className="mt-6">+ New Deal</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cream-200 rounded-xl p-4 border border-cream-300">
              <p className="text-sm text-navy-400">Active Deals</p>
              <p className="text-2xl font-display text-navy-600 mt-1">{activeDeals.length}</p>
            </div>
            <div className="bg-cream-200 rounded-xl p-4 border border-cream-300">
              <p className="text-sm text-navy-400">Closed This Month</p>
              <p className="text-2xl font-display text-navy-600 mt-1">{completedThisMonth.length}</p>
            </div>
            <div className="bg-cream-200 rounded-xl p-4 border border-cream-300">
              <p className="text-sm text-navy-400">Pending Signatures</p>
              <p className="text-2xl font-display text-navy-600 mt-1">{pendingSignatures.length}</p>
            </div>
            <div className="bg-cream-200 rounded-xl p-4 border border-cream-300">
              <p className="text-sm text-navy-400">Total Parties</p>
              <p className="text-2xl font-display text-navy-600 mt-1">{totalParties}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-navy-600">Recent Deals</h2>
            <Link href="/deals/new">
              <Button>+ New Deal</Button>
            </Link>
          </div>

          <div className="grid gap-4">
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
  );
}
