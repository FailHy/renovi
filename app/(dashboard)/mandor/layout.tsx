// FILE: app/(dashboard)/mandor/layout.tsx
// ========================================
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function MandorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'mandor') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Sidebar role="mandor" userName={session.user.name || 'Mandor'} />
      
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}