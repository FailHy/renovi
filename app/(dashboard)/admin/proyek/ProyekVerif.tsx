'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks } from '@/lib/db/schema'
import { eq, and, not } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function verifyProjectCompletion(
  projectId: string,
  isVerified: boolean,
  note?: string
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { 
        success: false, 
        error: 'Unauthorized - Admin only' 
      }
    }

    const project = await db.query.projeks.findFirst({
      where: eq(projeks.id, projectId),
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found'
      }
    }

    // Update verification status
    const updateData: any = {
      isVerifiedComplete: isVerified,
      updatedAt: new Date()
    }

    if (isVerified) {
      updateData.verifiedBy = session.user.id
      updateData.verifiedAt = new Date()
      if (note) updateData.verificationNote = note
    } else {
      updateData.verifiedBy = null
      updateData.verifiedAt = null
      updateData.verificationNote = null
    }

    const updated = await db.update(projeks)
      .set(updateData)
      .where(eq(projeks.id, projectId))
      .returning()

    revalidatePath('/admin/proyek')
    revalidatePath(`/admin/proyek/${projectId}`)

    return {
      success: true,
      data: updated[0],
      message: isVerified 
        ? 'Proyek berhasil diverifikasi selesai' 
        : 'Verifikasi proyek dibatalkan'
    }
  } catch (error) {
    console.error('Error verifying project:', error)
    return {
      success: false,
      error: 'Failed to verify project completion'
    }
  }
}

export async function getProjectsPendingVerification() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { 
        success: false, 
        error: 'Unauthorized - Admin only',
        data: [] 
      }
    }

    const projects = await db.query.projeks.findMany({
      where: and(
        eq(projeks.progress, 100),
        eq(projeks.status, 'Selesai'),
        eq(projeks.isVerifiedComplete, false)
      ),
      with: {
        pelanggan: {
          columns: {
            nama: true,
            telpon: true,
            email: true
          }
        },
        mandor: {
          columns: {
            nama: true,
            telpon: true
          }
        }
      },
      orderBy: (projeks, { desc }) => [desc(projeks.selesai)]
    })

    return {
      success: true,
      data: projects
    }
  } catch (error) {
    console.error('Error fetching pending verification projects:', error)
    return {
      success: false,
      error: 'Failed to fetch projects',
      data: []
    }
  }
}