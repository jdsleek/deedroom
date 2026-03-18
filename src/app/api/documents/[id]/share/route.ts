import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createHmac } from "crypto"

function generateShareToken(docId: string, expiresAt: number): string {
  const secret = process.env.PDF_SEAL_SALT || process.env.AUTH_SECRET || 'fallback-secret'
  const payload = `${docId}:${expiresAt}`
  const hmac = createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64url')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = (session?.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: docId } = await params
    const body = await request.json()
    const expiryHours = body.expiry_hours ?? 24

    const doc = await prisma.document.findUnique({
      where: { id: docId },
      include: { deal: { include: { parties: true } } },
    })
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    const isCreator = doc.deal.createdById === userId
    const isParty = doc.deal.parties.some((p) => p.userId === userId)
    if (!isCreator && !isParty) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const expiresAt = Date.now() + expiryHours * 60 * 60 * 1000
    const token = generateShareToken(docId, expiresAt)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${appUrl}/api/shared/${token}`

    return NextResponse.json({
      data: {
        url: shareUrl,
        expires_at: new Date(expiresAt).toISOString(),
        expiry_hours: expiryHours,
      },
    })
  } catch (e) {
    console.error("[Share] Error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
