// FILE: lib/actions/klien/nota.ts
'use server'

import { getNotaByIdShared } from '@/lib/actions/shared/notaShared'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/lib/utils/sharedRoles'

export async function getNotaByIdForKlien(notaId: string) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized - Please login first',
        data: null 
      }
    }

    if (!session?.user?.role) {
      return { 
        success: false, 
        error: 'Unauthorized - User role not found',
        data: null 
      }
    }

    // Log untuk debugging
    console.log('🔐 Klien nota access:', {
      notaId,
      userId: session.user.id,
      userRole: session.user.role,
      userName: session.user.name
    })

    // Call the SHARED version (3 parameters)
    const result = await getNotaByIdShared(
      notaId, 
      session.user.id, 
      session.user.role as UserRole
    )

    return result

  } catch (error) {
    console.error('Error in getNotaByIdForKlien:', error)
    return { 
      success: false, 
      error: 'Failed to fetch nota details', 
      data: null 
    }
  }
}