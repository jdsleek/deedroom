import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { AdminShell } from './AdminShell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id

  if (!userId) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <SessionProvider session={session}>
      <AdminShell user={session?.user}>{children}</AdminShell>
    </SessionProvider>
  )
}
