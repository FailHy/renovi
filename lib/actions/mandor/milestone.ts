// FILE: lib/actions/mandor/milestone.ts
// ========================================
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks, milestones } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Get Milestones by Project ID
 * Only returns milestones if project belongs to the logged-in mandor
 */
export async function getMilestonesByProjectId(projectId: string) {
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
        error: 'Project not found or unauthorized',
        data: []
      }
    }

    const projectMilestones = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, projectId),
      orderBy: (milestones, { asc }) => [asc(milestones.tanggal)]
    })

    return {
      success: true,
      data: projectMilestones
    }
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return {
      success: false,
      error: 'Failed to fetch milestones',
      data: []
    }
  }
}

/**
 * Create Milestone
 * Creates a new milestone for a project (with optional photo upload)
 */
export async function createMilestone(data: {
  proyekId: string
  nama: string
  deskripsi: string
  tanggal: string
  status?: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
  gambar?: string[]
}) {
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
        eq(projeks.id, data.proyekId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or unauthorized'
      }
    }

    // Create milestone
    const newMilestone = await db.insert(milestones)
      .values({
        proyekId: data.proyekId,
        nama: data.nama,
        deskripsi: data.deskripsi,
        tanggal: new Date(data.tanggal),
        status: data.status || 'Belum Dimulai',
        gambar: data.gambar || [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, data.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${data.proyekId}`)

    return {
      success: true,
      data: newMilestone[0]
    }
  } catch (error) {
    console.error('Error creating milestone:', error)
    return {
      success: false,
      error: 'Failed to create milestone'
    }
  }
}

/**
 * Update Milestone
 * Updates milestone details
 */
export async function updateMilestone(
  milestoneId: string,
  data: {
    nama?: string
    deskripsi?: string
    tanggal?: string
    status?: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
    gambar?: string[]
  }
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

    // Get milestone with project check
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        projek: true
      }
    })

    if (!milestone) {
      return {
        success: false,
        error: 'Milestone not found'
      }
    }

    // Check if project belongs to mandor
    if (milestone.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.nama !== undefined) updateData.nama = data.nama
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi
    if (data.tanggal !== undefined) updateData.tanggal = new Date(data.tanggal)
    if (data.status !== undefined) {
      updateData.status = data.status
      
      // Set dates based on status
      if (data.status === 'Dalam Progress' && !milestone.mulai) {
        updateData.mulai = new Date()
      } else if (data.status === 'Selesai') {
        updateData.selesai = new Date()
        if (!milestone.mulai) {
          updateData.mulai = new Date()
        }
      }
    }
    if (data.gambar !== undefined) updateData.gambar = data.gambar

    // Update milestone
    const updated = await db.update(milestones)
      .set(updateData)
      .where(eq(milestones.id, milestoneId))
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, milestone.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${milestone.proyekId}`)

    return {
      success: true,
      data: updated[0]
    }
  } catch (error) {
    console.error('Error updating milestone:', error)
    return {
      success: false,
      error: 'Failed to update milestone'
    }
  }
}

/**
 * Delete Milestone
 * Deletes a milestone (soft delete by keeping record but removing from view)
 */
export async function deleteMilestone(milestoneId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Get milestone with project check
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        projek: true
      }
    })

    if (!milestone) {
      return {
        success: false,
        error: 'Milestone not found'
      }
    }

    // Check if project belongs to mandor
    if (milestone.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Delete milestone (cascade will handle related records)
    await db.delete(milestones)
      .where(eq(milestones.id, milestoneId))

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, milestone.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${milestone.proyekId}`)

    return {
      success: true,
      message: 'Milestone deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return {
      success: false,
      error: 'Failed to delete milestone'
    }
  }
}

/**
 * Update Milestone Status Only
 * Quick update for milestone status (commonly used in UI)
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
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

    // Get milestone with project check
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        projek: true
      }
    })

    if (!milestone) {
      return {
        success: false,
        error: 'Milestone not found'
      }
    }

    // Check if project belongs to mandor
    if (milestone.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Set dates based on status
    if (status === 'Dalam Progress' && !milestone.mulai) {
      updateData.mulai = new Date()
    } else if (status === 'Selesai') {
      updateData.selesai = new Date()
      if (!milestone.mulai) {
        updateData.mulai = new Date()
      }
    }

    // Update milestone
    const updated = await db.update(milestones)
      .set(updateData)
      .where(eq(milestones.id, milestoneId))
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, milestone.proyekId))

    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${milestone.proyekId}`)

    return {
      success: true,
      data: updated[0]
    }
  } catch (error) {
    console.error('Error updating milestone status:', error)
    return {
      success: false,
      error: 'Failed to update milestone status'
    }
  }
}