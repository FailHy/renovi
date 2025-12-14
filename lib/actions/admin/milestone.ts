// FILE: lib/actions/admin/milestone.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { milestones, projeks, type NewMilestone } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 *  CENTRALIZED PROGRESS CALCULATION - Admin Version
 */
async function updateProjectProgress(proyekId: string) {
  console.log('🚀 [ADMIN UPDATE_PROGRESS] Starting for project:', proyekId)
  
  try {
    // 1. Ambil semua milestone
    const projectMilestones = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, proyekId),
    })

    console.log('📊 [ADMIN] Milestones found:', projectMilestones.length)
    console.log('📋 [ADMIN] Milestone statuses:', 
      projectMilestones.map(m => ({ id: m.id, nama: m.nama, status: m.status }))
    )

    if (projectMilestones.length === 0) {
      console.log('  [ADMIN] No milestones, setting progress to 0')
      await db.update(projeks)
        .set({
          progress: 0,
          lastUpdate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(projeks.id, proyekId))
      return
    }

    // 2. Hitung Statistik
    const total = projectMilestones.length
    const cancelled = projectMilestones.filter(m => m.status === 'Dibatalkan').length
    const completed = projectMilestones.filter(m => m.status === 'Selesai').length
    const inProgress = projectMilestones.filter(m => m.status === 'Dalam Progress').length

    console.log('📈 [ADMIN] Statistics:', { 
      total, 
      cancelled, 
      completed, 
      inProgress 
    })

    // 3. Hitung Progress %
    const effectiveTotal = total - cancelled
    let progress = 0
    
    if (effectiveTotal > 0) {
      progress = Math.round((completed / effectiveTotal) * 100)
    }

    console.log('💯 [ADMIN] Calculated progress:', progress, '%')

    // 4. Tentukan Status Proyek
    let newStatus: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan' = 'Perencanaan'

    if (effectiveTotal > 0 && completed === effectiveTotal) {
      newStatus = 'Selesai'
    } else if (cancelled === total) {
      newStatus = 'Dibatalkan'
    } else if (completed === 0 && inProgress === 0) {
      newStatus = 'Perencanaan'
    } else {
      newStatus = 'Dalam Progress'
    }

    console.log('🎯 [ADMIN] New status:', newStatus)

    // 5. Update Database
    const updateData: any = {
      progress,
      status: newStatus,
      lastUpdate: new Date(),
      updatedAt: new Date(),
    }

    if (newStatus === 'Selesai') {
      updateData.selesai = new Date()
      console.log('   [ADMIN] Setting completion date')
    }

    console.log('💾 [ADMIN] Updating database with:', updateData)

    const updated = await db.update(projeks)
      .set(updateData)
      .where(eq(projeks.id, proyekId))
      .returning()

    console.log('✨ [ADMIN] Database updated successfully:', updated[0])
    console.log('   [ADMIN] COMPLETE - Progress:', progress, '% | Status:', newStatus)
  } catch (error) {
    console.error('❌ [ADMIN UPDATE_PROGRESS] ERROR:', error)
    console.error('❌ [ADMIN] Stack:', error instanceof Error ? error.stack : 'No stack')
    throw error
  }
}

export async function createMilestone(data: NewMilestone) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [milestone] = await db.insert(milestones).values(data).returning()

    //  Update project progress after creation
    await updateProjectProgress(data.proyekId)

    //  Fixed revalidatePath syntax
    revalidatePath('/admin/proyek')
    revalidatePath(`/admin/proyek/${data.proyekId}`)

    return { success: true, data: milestone }
  } catch (error) {
    console.error('Error creating milestone:', error)
    return { success: false, error: 'Gagal membuat milestone' }
  }
}

export async function updateMilestone(id: string, data: Partial<NewMilestone>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [milestone] = await db
      .update(milestones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(milestones.id, id))
      .returning()

    //  Update project progress after update
    if (milestone) {
      await updateProjectProgress(milestone.proyekId)
    }

    revalidatePath('/admin/proyek')
    if (milestone) {
      revalidatePath(`/admin/proyek/${milestone.proyekId}`)
    }

    return { success: true, data: milestone }
  } catch (error) {
    console.error('Error updating milestone:', error)
    return { success: false, error: 'Gagal mengupdate milestone' }
  }
}

export async function updateMilestoneStatus(
  id: string,
  status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Get milestone first
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    })

    if (!milestone) {
      return { success: false, error: 'Milestone tidak ditemukan' }
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
    } else if (status === 'Dibatalkan' || status === 'Belum Dimulai') {
      // Reset dates if cancelled or back to not started
      updateData.mulai = null
      updateData.selesai = null
    }

    const [updated] = await db
      .update(milestones)
      .set(updateData)
      .where(eq(milestones.id, id))
      .returning()

    //  CRITICAL: Update project progress after status change
    if (updated) {
      await updateProjectProgress(updated.proyekId)
    }

    revalidatePath('/admin/proyek')
    if (updated) {
      revalidatePath(`/admin/proyek/${updated.proyekId}`)
    }

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error updating milestone status:', error)
    return { success: false, error: 'Gagal mengupdate status milestone' }
  }
}

export async function deleteMilestone(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    })

    if (milestone) {
      await db.delete(milestones).where(eq(milestones.id, id))
      
      //  Update project progress after deletion
      await updateProjectProgress(milestone.proyekId)
      
      revalidatePath('/admin/proyek')
      revalidatePath(`/admin/proyek/${milestone.proyekId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return { success: false, error: 'Gagal menghapus milestone' }
  }
}

/**
 *  Force recalculate progress for a project
 * Useful for fixing inconsistent data
 */
export async function recalculateProjectProgress(proyekId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    await updateProjectProgress(proyekId)
    
    revalidatePath('/admin/proyek')
    revalidatePath(`/admin/proyek/${proyekId}`)

    return { success: true, message: 'Progress berhasil dihitung ulang' }
  } catch (error) {
    console.error('Error recalculating progress:', error)
    return { success: false, error: 'Gagal menghitung ulang progress' }
  }
}