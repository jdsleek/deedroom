import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!profile) return NextResponse.json({ data: null })

  return NextResponse.json({
    data: {
      id: profile.id,
      full_name: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      role: profile.role,
      company_name: profile.companyName,
      kyc_status: profile.kycStatus,
      avatar_url: profile.avatarUrl,
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString(),
    },
  })
}

export async function PATCH(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { full_name, phone, company_name } = body

  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: {
      fullName: full_name ?? undefined,
      phone: phone !== undefined ? phone : undefined,
      companyName: company_name !== undefined ? company_name : undefined,
    },
    create: {
      id: userId,
      fullName: full_name ?? 'User',
      phone: phone ?? null,
      companyName: company_name ?? null,
      email: session?.user?.email ?? null,
    },
  })

  return NextResponse.json({
    data: {
      id: profile.id,
      full_name: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      company_name: profile.companyName,
    },
  })
}
