import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'
import { sendWhatsAppInvite, sendSms } from '@/lib/termii'
import { sendEmail, inviteEmailHtml } from '@/lib/email'
import { partyToApi } from '@/lib/serialize'
import { can } from '@/lib/rbac'
import { notify } from '@/lib/notifications'

const InvitePartySchema = z.object({
  deal_id: z.string().uuid(),
  role: z.enum(['agent', 'landlord', 'tenant', 'buyer', 'developer', 'lawyer']),
  invite_name: z.string().min(1).max(200),
  invite_phone: z.string().optional().nullable(),
  invite_email: z.string().email().optional().nullable(),
  sign_order: z.number().int().min(1).optional().nullable(),
  channel: z.enum(['whatsapp', 'sms']).optional().default('whatsapp'),
}).refine((d) => d.invite_phone || d.invite_email, { message: 'Phone or email required' })

export async function POST(request: Request) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || !can(profile.role, 'invite_party')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = InvitePartySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const deal = await prisma.deal.findFirst({
    where: { id: parsed.data.deal_id, createdById: userId },
    select: { id: true, title: true, propertyAddress: true },
  })

  if (!deal) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let matchedUserId: string | null = null
  if (parsed.data.invite_email) {
    const matchedUser = await prisma.user.findFirst({
      where: { email: { equals: parsed.data.invite_email, mode: 'insensitive' } },
      select: { id: true },
    })
    if (matchedUser) matchedUserId = matchedUser.id
  }

  let party
  try {
    party = await prisma.dealParty.create({
      data: {
        dealId: parsed.data.deal_id,
        role: parsed.data.role,
        signOrder: parsed.data.sign_order ?? null,
        inviteName: parsed.data.invite_name,
        invitePhone: parsed.data.invite_phone ?? null,
        inviteEmail: parsed.data.invite_email ?? null,
        userId: matchedUserId,
      },
    })
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Party already invited with this contact' }, { status: 409 })
    }
    throw e
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteLink = `${appUrl}/invite/${party.inviteToken}`

  const message = `You've been invited to review and sign documents for: ${deal.title} at ${deal.propertyAddress}. Open: ${inviteLink}`

  if (parsed.data.invite_phone) {
    try {
      if (parsed.data.channel === 'sms') {
        await sendSms(parsed.data.invite_phone, message)
      } else {
        await sendWhatsAppInvite(parsed.data.invite_phone, message)
      }
    } catch (e) {
      console.error('Termii send failed:', e)
    }
  }

  if (parsed.data.invite_email) {
    try {
      await sendEmail({
        to: [{ email: parsed.data.invite_email, name: parsed.data.invite_name }],
        subject: `You're invited to sign: ${deal.title}`,
        htmlContent: inviteEmailHtml({
          inviteName: parsed.data.invite_name,
          dealTitle: deal.title,
          propertyAddress: deal.propertyAddress,
          inviteLink,
          senderName: session?.user?.name ?? 'A SignNest user',
        }),
      })
    } catch (e) {
      console.error('Brevo email failed:', e)
    }
  }

  await prisma.deal.updateMany({
    where: { id: parsed.data.deal_id, status: 'draft' },
    data: { status: 'sent' },
  })

  await logAudit({
    dealId: parsed.data.deal_id,
    action: 'party_invited',
    actorId: userId,
    metadata: { party_id: party.id, role: parsed.data.role, invite_name: parsed.data.invite_name },
  })

  if (matchedUserId) {
    await notify({
      userId: matchedUserId,
      type: 'invite',
      title: 'New Deal Invitation',
      message: `You've been invited as ${parsed.data.role} for "${deal.title}" at ${deal.propertyAddress}`,
      link: `/deals/${deal.id}`,
    })
  }

  return NextResponse.json({ data: { ...partyToApi(party), invite_link: inviteLink } })
}
