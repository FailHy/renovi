// FILE: app/(dashboard)/layout.tsx
// ========================================
// SINGLE LAYOUT FOR ALL ROLES (admin, klien, mandor)
// ========================================

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardLayoutClient } from './DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login')
  }

  // Validate role
  const allowedRoles = ['admin', 'klien', 'mandor'] as const
  type AllowedRole = typeof allowedRoles[number]
  
  const userRole = session.user.role as string

  // Check if role is valid
  if (!allowedRoles.includes(userRole as AllowedRole)) {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayoutClient 
      role={userRole as AllowedRole}
      userName={session.user.name || 'User'}
      userEmail={session.user.email || ''}
    >
      {children}
    </DashboardLayoutClient>
  )
}