import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { AdminSidebar } from './AdminSidebar'
import { Topbar } from '@/components/layout/Topbar'

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
      <div className="min-h-screen bg-warm-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar user={session?.user} />
          <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
