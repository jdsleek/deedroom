import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { getFileStream } from '@/lib/storage'
import path from 'path'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdmin()
    const { userId } = await params

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { kycData: true, kycStatus: true, fullName: true },
    })
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const kycData = profile.kycData as Record<string, string>
    const fileType = request.nextUrl.searchParams.get('file')

    if (!fileType || !kycData[`${fileType}_path`]) {
      return NextResponse.json({
        data: {
          kycStatus: profile.kycStatus,
          kycData,
          fullName: profile.fullName,
        },
      })
    }

    const filePath = kycData[`${fileType}_path`]
    const buffer = await getFileStream(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeMap[ext] ?? 'application/octet-stream',
        'Content-Disposition': `inline; filename="${fileType}${ext}"`,
      },
    })
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[admin/kyc]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
