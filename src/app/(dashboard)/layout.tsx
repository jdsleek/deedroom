import { auth } from '@/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { SessionProvider } from 'next-auth/react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-cream-100 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <Topbar user={session?.user} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
