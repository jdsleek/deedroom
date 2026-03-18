import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function requireAdmin() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id
  if (!userId) throw new Error('Unauthorized')

  const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') throw new Error('Forbidden')

  return { userId, session }
}
