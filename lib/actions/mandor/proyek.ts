// FILE: lib/actions/mandor/proyek.ts
// ========================================
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Get Single Project by ID (with authorization check)
 * Only returns project if it belongs to the logged-in mandor
 */
export async function getProjectById(projectId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: null 
      }
    }

    const mandorId = session.user.id

    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, projectId),
        eq(projeks.mandorId, mandorId)
      ),
      with: {
        pelanggan: {
          columns: {
            id: true,
            nama: true,
            telpon: true,
            email: true,
            alamat: true
          }
        },
        mandor: {
          columns: {
            id: true,
            nama: true,
            telpon: true
          }
        }
      }
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized',
        data: null
      }
    }

    return {
      success: true,
      data: project
    }
  } catch (error) {
    console.error('Error fetching project:', error)
    return {
      success: false,
      error: 'Failed to fetch project',
      data: null
    }
  }
}

/**
 * Update Project Progress
 * Mandor can update the progress percentage of their project
 */
export async function updateProjectProgress(projectId: string, progress: number) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      return {
        success: false,
        error: 'Progress must be between 0 and 100'
      }
    }

    const mandorId = session.user.id

    // Check if project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, projectId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized'
      }
    }

    // Update progress
    const updated = await db.update(projeks)
      .set({ 
        progress,
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, projectId))
      .returning()

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${projectId}`)

    return {
      success: true,
      data: updated[0]
    }
  } catch (error) {
    console.error('Error updating project progress:', error)
    return {
      success: false,
      error: 'Failed to update project progress'
    }
  }
}

/**
 * Update Project Status
 * Mandor can update the status of their project
 */
export async function updateProjectStatus(
  projectId: string, 
  status: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Check if project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, projectId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized'
      }
    }

    // Update status and set completion date if status is 'Selesai'
    const updateData: any = {
      status,
      lastUpdate: new Date(),
      updatedAt: new Date()
    }

    if (status === 'Selesai') {
      updateData.selesai = new Date()
      updateData.progress = 100
    }

    const updated = await db.update(projeks)
      .set(updateData)
      .where(eq(projeks.id, projectId))
      .returning()

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${projectId}`)

    return {
      success: true,
      data: updated[0]
    }
  } catch (error) {
    console.error('Error updating project status:', error)
    return {
      success: false,
      error: 'Failed to update project status'
    }
  }
}

/**
 * Get Projects by Status
 * Filter mandor's projects by status
 */
export async function getProjectsByStatus(
  status: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: []
      }
    }

    const mandorId = session.user.id

    const projects = await db.query.projeks.findMany({
      where: and(
        eq(projeks.mandorId, mandorId),
        eq(projeks.status, status)
      ),
      orderBy: (projeks, { desc }) => [desc(projeks.lastUpdate)],
      with: {
        pelanggan: {
          columns: {
            id: true,
            nama: true,
            telpon: true
          }
        }
      }
    })

    return {
      success: true,
      data: projects
    }
  } catch (error) {
    console.error('Error fetching projects by status:', error)
    return {
      success: false,
      error: 'Failed to fetch projects',
      data: []
    }
  }
}