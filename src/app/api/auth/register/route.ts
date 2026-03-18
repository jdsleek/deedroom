import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1).max(200),
  phone: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email: rawEmail, password: rawPassword, fullName, phone } = parsed.data
  const email = rawEmail.trim().toLowerCase()
  const password = rawPassword.trim()

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hashed = await hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email: email,
      name: fullName,
      password: hashed,
      phone: phone ?? null,
    },
  })

  await prisma.profile.create({
    data: {
      id: user.id,
      fullName,
      email,
      phone: phone ?? null,
    },
  })

  return NextResponse.json({ data: { id: user.id, email: user.email } })
}
