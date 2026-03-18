import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { generateEvidencePdf } from '@/lib/pdf'
import { dealToApi, partyToApi } from '@/lib/serialize'
import type { Deal, DealParty, AuditLog } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { dealId } = await params

  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      OR: [{ createdById: userId }, { parties: { some: { userId } } }],
    },
    include: {
      parties: true,
    },
  })

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { dealId },
    orderBy: { createdAt: 'asc' },
  })

  const dealApi = dealToApi(deal)
  const partiesApi = deal.parties.map((p) => partyToApi(p))
  const auditLogsApi = auditLogs.map((l) => ({
    id: l.id,
    deal_id: l.dealId,
    action: l.action,
    actor_id: l.actorId,
    actor_name: l.actorName,
    actor_phone: l.actorPhone,
    metadata: l.metadata as Record<string, unknown>,
    ip_address: l.ipAddress,
    user_agent: l.userAgent,
    created_at: l.createdAt.toISOString(),
  }))

  const pdfBytes = await generateEvidencePdf({
    deal: dealApi as Deal,
    parties: partiesApi as DealParty[],
    auditLogs: auditLogsApi as AuditLog[],
    generatedAt: new Date(),
  })

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="DeedRoom-Evidence-${dealId.slice(0, 8)}.pdf"`,
    },
  })
}
