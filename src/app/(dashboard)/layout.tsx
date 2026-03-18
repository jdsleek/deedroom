import { auth } from '@/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
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
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar user={session?.user} />
          <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6 pb-24 lg:pb-6">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </SessionProvider>
  )
}
