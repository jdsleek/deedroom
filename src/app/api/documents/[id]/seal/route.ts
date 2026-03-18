import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { sealExecutedPdf } from '@/lib/pdf'
import { logAudit } from '@/lib/audit'
import { dealToApi, partyToApi } from '@/lib/serialize'
import { getFileStream, saveFile } from '@/lib/storage'
import type { Deal, DealParty, AuditLog } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { deal: true },
    })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (doc.deal.createdById !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const fileBuf = await getFileStream(doc.filePath)
    const pdfBytes = await new Response(fileBuf).arrayBuffer()

    const parties = await prisma.dealParty.findMany({
      where: { dealId: doc.dealId, status: 'signed' },
    })
    const sigRequests = await prisma.signatureRequest.findMany({
      where: { documentId: doc.id, signedAt: { not: null } },
      include: { party: true },
    })
    const auditLogs = await prisma.auditLog.findMany({
      where: { dealId: doc.dealId },
      orderBy: { createdAt: 'asc' },
    })

    const dealApi = dealToApi(doc.deal) as Deal
    const partiesApi = parties.map((p) => partyToApi(p)) as DealParty[]
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
    })) as AuditLog[]

    const signatureImages = sigRequests
      .filter(sr => sr.signatureData && sr.signedAt)
      .map(sr => ({
        partyName: parties.find(p => p.id === sr.partyId)?.inviteName ?? 'Unknown',
        signatureData: sr.signatureData!,
      }))

    const sealed = await sealExecutedPdf({
      pdfBytes,
      deal: dealApi,
      parties: partiesApi,
      auditLogs: auditLogsApi,
      sealedAt: new Date(),
      signatureImages,
    })

    const sealedPath = `${doc.dealId}/${crypto.randomUUID()}-executed-${doc.name}`
    await saveFile(sealedPath, Buffer.from(sealed))

    const sealedDoc = await prisma.document.create({
      data: {
        dealId: doc.dealId,
        name: `Executed - ${doc.name}`,
        filePath: sealedPath,
        fileSize: BigInt(sealed.length),
        fileType: 'application/pdf',
        category: doc.category,
        permission: 'download',
        watermark: false,
        uploadedById: userId,
        isExecuted: true,
      },
    })

    await logAudit({
      dealId: doc.dealId,
      action: 'signature_completed',
      actorId: userId,
      metadata: { documentId: sealedDoc.id, sealedDocument: doc.name },
    })

    return NextResponse.json({
      data: {
        id: sealedDoc.id,
        deal_id: sealedDoc.dealId,
        name: sealedDoc.name,
        file_path: sealedDoc.filePath,
        file_size: Number(sealedDoc.fileSize),
        file_type: sealedDoc.fileType,
        category: sealedDoc.category,
        permission: sealedDoc.permission,
        watermark: sealedDoc.watermark,
        uploaded_by: sealedDoc.uploadedById,
        expires_at: sealedDoc.expiresAt?.toISOString() ?? null,
        is_executed: sealedDoc.isExecuted,
        version: sealedDoc.version,
        created_at: sealedDoc.createdAt.toISOString(),
        updated_at: sealedDoc.updatedAt.toISOString(),
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
