import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { notify } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')))
    const search = url.searchParams.get('search')?.trim() ?? ''

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true, name: true, image: true } } },
      }),
      prisma.profile.count({ where }),
    ])

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email ?? u.user?.email ?? null,
        phone: u.phone,
        role: u.role,
        kycStatus: u.kycStatus,
        companyName: u.companyName,
        avatarUrl: u.avatarUrl,
        flagged: u.flagged,
        flagReason: u.flagReason,
        createdAt: u.createdAt.toISOString(),
        userName: u.user?.name ?? null,
        userImage: u.user?.image ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { userId, role, kycStatus, flagged, flagReason } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const data: Record<string, string | boolean | null> = {}
    if (role) data.role = role
    if (kycStatus) data.kycStatus = kycStatus
    if (typeof flagged === 'boolean') data.flagged = flagged
    if (flagReason !== undefined) data.flagReason = String(flagReason ?? '').trim() || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data,
    })

    if (kycStatus === 'verified') {
      await notify({
        userId,
        type: 'kyc',
        title: 'Identity Verified',
        message: 'Your KYC has been approved. You now have full access to all SignNest features.',
        link: '/kyc',
      })
    } else if (kycStatus === 'rejected') {
      await notify({
        userId,
        type: 'kyc',
        title: 'KYC Rejected',
        message: 'Your identity verification was not approved. Please resubmit with valid documents.',
        link: '/kyc',
      })
    }

    return NextResponse.json({
      id: updated.id,
      role: updated.role,
      kycStatus: updated.kycStatus,
      flagged: updated.flagged,
      flagReason: updated.flagReason,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
