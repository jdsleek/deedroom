import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createHmac } from "crypto"
import path from "path"
import fs from "fs"

function verifyShareToken(token: string): { docId: string; expiresAt: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length !== 3) return null
    const [docId, expiresStr, hmac] = parts
    const expiresAt = parseInt(expiresStr, 10)
    if (isNaN(expiresAt)) return null

    const secret = process.env.PDF_SEAL_SALT || process.env.AUTH_SECRET || 'fallback-secret'
    const expectedHmac = createHmac('sha256', secret).update(`${docId}:${expiresStr}`).digest('hex')
    if (hmac !== expectedHmac) return null

    return { docId, expiresAt }
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = verifyShareToken(token)
    if (!result) {
      return NextResponse.json({ error: "Invalid or tampered link" }, { status: 403 })
    }

    if (Date.now() > result.expiresAt) {
      return NextResponse.json({ error: "This link has expired" }, { status: 410 })
    }

    const doc = await prisma.document.findUnique({ where: { id: result.docId } })
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), "uploads", doc.filePath)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const contentType = doc.fileType || "application/pdf"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${doc.name}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (e) {
    console.error("[SharedLink] Error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
