import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { dealToApi, partyToApi, documentToApi, sigRequestToApi } from '@/lib/serialize'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      parties: { include: { user: true } },
      documents: {},
      signatureRequests: {},
    },
  })

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const isCreator = deal.createdById === userId
  const isParty = deal.parties.some((p) => p.userId === userId)

  if (!isCreator && !isParty) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (isParty && !isCreator) {
    const party = deal.parties.find((p) => p.userId === userId)
    if (party && party.status === 'invited') {
      await prisma.dealParty.update({
        where: { id: party.id },
        data: { status: 'viewed', viewedAt: new Date() },
      })
      await logAudit({
        dealId: id,
        action: 'party_viewed',
        actorId: userId,
        actorName: session?.user?.name ?? session?.user?.email ?? undefined,
      })
    }

    if (deal.status === 'sent') {
      await prisma.deal.update({ where: { id }, data: { status: 'viewing' } })
    }
  }

  const data = {
    ...dealToApi(deal),
    parties: deal.parties.map((p) => ({ ...partyToApi(p), profile: p.user ? { id: p.user.id, full_name: p.user.fullName } : null })),
    documents: deal.documents.map(documentToApi),
    signature_requests: deal.signatureRequests.map(sigRequestToApi),
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.deal.findUnique({ where: { id }, select: { createdById: true } })
  if (!existing || existing.createdById !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const update: Record<string, unknown> = {}
  const map: Record<string, string> = {
    deal_type: 'dealType',
    property_address: 'propertyAddress',
    property_type: 'propertyType',
    rent_amount: 'rentAmount',
    rent_period: 'rentPeriod',
    rent_start_date: 'rentStartDate',
    rent_end_date: 'rentEndDate',
    caution_fee: 'cautionFee',
    agency_fee: 'agencyFee',
    legal_fee: 'legalFee',
    sale_price: 'salePrice',
  }
  for (const [k, v] of Object.entries(body)) {
    const key = map[k] ?? k
    if (['rentAmount', 'cautionFee', 'agencyFee', 'legalFee', 'salePrice'].includes(key) && typeof v === 'number') {
      update[key] = BigInt(v)
    } else if (['rentStartDate', 'rentEndDate'].includes(key) && v) {
      update[key] = new Date(v as string)
    } else {
      update[key] = v
    }
  }

  const deal = await prisma.deal.update({ where: { id }, data: update as never })
  await logAudit({ dealId: id, action: 'deal_updated', actorId: userId })
  return NextResponse.json({ data: dealToApi(deal) })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.deal.findUnique({ where: { id }, select: { createdById: true } })
  if (!existing || existing.createdById !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.deal.update({
    where: { id },
    data: { status: 'cancelled', cancelledAt: new Date() },
  })
  await logAudit({ dealId: id, action: 'deal_cancelled', actorId: userId })
  return NextResponse.json({ data: { ok: true } })
}
