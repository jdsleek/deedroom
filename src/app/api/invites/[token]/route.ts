import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const party = await prisma.dealParty.findUnique({
    where: { inviteToken: token },
    include: { deal: { include: { createdBy: true } } },
  })

  if (!party?.deal) {
    return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })
  }

  const agentName = party.deal.createdBy?.fullName ?? 'the agent'

  return NextResponse.json({
    data: {
      deal: {
        id: party.deal.id,
        title: party.deal.title,
        property_address: party.deal.propertyAddress,
        deal_type: party.deal.dealType,
      },
      party: { id: party.id, role: party.role, invite_name: party.inviteName },
      dealId: party.deal.id,
      partyId: party.id,
      agentName,
    },
  })
}
