import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

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
    const { userId, role, kycStatus } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const data: Record<string, string> = {}
    if (role) data.role = role
    if (kycStatus) data.kycStatus = kycStatus

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data,
    })

    return NextResponse.json({
      id: updated.id,
      role: updated.role,
      kycStatus: updated.kycStatus,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
