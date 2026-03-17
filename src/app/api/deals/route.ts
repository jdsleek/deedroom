import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'
import { serializeDeal } from '@/lib/serialize'

const CreateDealSchema = z.object({
  deal_type: z.enum(['rent', 'sale']),
  title: z.string().min(1).max(200),
  property_address: z.string().min(1).max(500),
  property_type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  rent_amount: z.number().optional().nullable(),
  rent_period: z.string().optional().nullable(),
  rent_start_date: z.string().optional().nullable(),
  rent_end_date: z.string().optional().nullable(),
  caution_fee: z.number().optional().nullable(),
  agency_fee: z.number().optional().nullable(),
  legal_fee: z.number().optional().nullable(),
  sale_price: z.number().optional().nullable(),
})

export async function GET(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const deals = await prisma.deal.findMany({
    where: {
      AND: [
        {
          OR: [
            { createdById: userId },
            { parties: { some: { userId } } },
          ],
        },
        ...(status ? [{ status }] : []),
        ...(type ? [{ dealType: type }] : []),
        ...(search
          ? [{
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { propertyAddress: { contains: search, mode: 'insensitive' } },
              ],
            }]
          : []),
      ],
    },
    include: {
      _count: { select: { parties: true, documents: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data = deals.map((d) => serializeDeal(d))
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateDealSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const p = parsed.data
  const deal = await prisma.deal.create({
    data: {
      dealType: p.deal_type,
      title: p.title,
      propertyAddress: p.property_address,
      propertyType: p.property_type ?? undefined,
      description: p.description ?? undefined,
      rentAmount: p.rent_amount != null ? BigInt(p.rent_amount) : undefined,
      rentPeriod: p.rent_period ?? undefined,
      rentStartDate: p.rent_start_date ? new Date(p.rent_start_date) : undefined,
      rentEndDate: p.rent_end_date ? new Date(p.rent_end_date) : undefined,
      cautionFee: p.caution_fee != null ? BigInt(p.caution_fee) : undefined,
      agencyFee: p.agency_fee != null ? BigInt(p.agency_fee) : undefined,
      legalFee: p.legal_fee != null ? BigInt(p.legal_fee) : undefined,
      salePrice: p.sale_price != null ? BigInt(p.sale_price) : undefined,
      createdById: userId,
      status: 'draft',
    },
  })

  await logAudit({
    dealId: deal.id,
    action: 'deal_created',
    actorId: userId,
    metadata: { deal_type: deal.dealType, title: deal.title },
  })

  return NextResponse.json({ data: serializeDeal(deal) })
}
