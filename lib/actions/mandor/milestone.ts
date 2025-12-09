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
 */
export async function createMilestone(data: {
  proyekId: string
  nama: string
  deskripsi: string
  tanggal: string
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

    // Parse tanggal dengan benar
    const tanggal = new Date(data.tanggal)
    if (isNaN(tanggal.getTime())) {
      return {
        success: false,
        error: 'Tanggal tidak valid'
      }
    }

    // Create milestone
    const newMilestone = await db.insert(milestones)
      .values({
        proyekId: data.proyekId,
        nama: data.nama.trim(),
        deskripsi: data.deskripsi.trim(),
        tanggal: tanggal,
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

async function updateProjectProgress(proyekId: string) {
  // 1. Ambil semua milestone
  const projectMilestones = await db.query.milestones.findMany({
    where: eq(milestones.proyekId, proyekId),
  })

  if (projectMilestones.length === 0) return

  // 2. Hitung Statistik
  const total = projectMilestones.length
  const cancelled = projectMilestones.filter(m => m.status === 'Dibatalkan').length
  const completed = projectMilestones.filter(m => m.status === 'Selesai').length
  const inProgress = projectMilestones.filter(m => m.status === 'Dalam Progress').length

  // 3. Hitung Progress % (Effective Total = Total - Cancelled)
  const effectiveTotal = total - cancelled
  let progress = 0
  
  if (effectiveTotal > 0) {
    progress = Math.round((completed / effectiveTotal) * 100)
  } else if (total > 0 && effectiveTotal === 0) {
    // Kasus khusus: Semua milestone dibatalkan
    progress = 0 
  }

  // 4. Tentukan Status Proyek
  let newStatus: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan' = 'Dalam Progress'

  if (effectiveTotal > 0 && completed === effectiveTotal) {
    // Jika semua yang aktif sudah selesai
    newStatus = 'Selesai'
  } else if (cancelled === total) {
    // Jika semua dibatalkan
    newStatus = 'Dibatalkan'
  } else if (completed === 0 && inProgress === 0) {
    // Jika belum ada yang mulai (dan masih ada yang aktif)
    newStatus = 'Perencanaan'
  } else {
    // Campuran
    newStatus = 'Dalam Progress'
  }

  // 5. Update Database
  const updateData: any = {
    progress,
    status: newStatus,
    lastUpdate: new Date(),
    updatedAt: new Date(),
  }

  // Auto set tanggal selesai jika status jadi Selesai
  if (newStatus === 'Selesai') {
    updateData.selesai = new Date()
  }

  await db
    .update(projeks)
    .set(updateData)
    .where(eq(projeks.id, proyekId))
}

/**
 * Update Milestone - IMPROVED VERSION
 */
export async function updateMilestone(
  milestoneId: string,
  data: {
    nama?: string
    deskripsi?: string
    tanggal?: string
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

    // Handle each field update properly
    if (data.nama !== undefined) {
      updateData.nama = data.nama.trim()
    }
    
    if (data.deskripsi !== undefined) {
      updateData.deskripsi = data.deskripsi.trim()
    }
    
    if (data.tanggal !== undefined) {
      const tanggal = new Date(data.tanggal)
      if (isNaN(tanggal.getTime())) {
        return {
          success: false,
          error: 'Tanggal tidak valid'
        }
      }
      updateData.tanggal = tanggal
    }
    
    if (data.gambar !== undefined) {
      updateData.gambar = data.gambar
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
      data: updated[0],
      message: 'Milestone berhasil diupdate'
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
 * NEW: Update Milestone using FormData (for client forms)
 */
export async function updateMilestoneForm(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const milestoneId = formData.get('id') as string
    const nama = formData.get('nama') as string
    const deskripsi = formData.get('deskripsi') as string
    const tanggal = formData.get('tanggal') as string

    // Validation
    if (!milestoneId) {
      return {
        success: false,
        error: 'Milestone ID tidak ditemukan'
      }
    }

    if (!nama?.trim()) {
      return {
        success: false,
        error: 'Nama milestone harus diisi'
      }
    }

    if (!deskripsi?.trim()) {
      return {
        success: false,
        error: 'Deskripsi milestone harus diisi'
      }
    }

    if (!tanggal) {
      return {
        success: false,
        error: 'Tanggal target harus diisi'
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
        error: 'Milestone tidak ditemukan'
      }
    }

    // Check if project belongs to mandor
    if (milestone.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Parse tanggal
    const tanggalDate = new Date(tanggal)
    if (isNaN(tanggalDate.getTime())) {
      return {
        success: false,
        error: 'Format tanggal tidak valid'
      }
    }

    // Prepare update data
    const updateData: any = {
      nama: nama.trim(),
      deskripsi: deskripsi.trim(),
      tanggal: tanggalDate,
      updatedAt: new Date()
    }

    // Update milestone
    const [updatedMilestone] = await db.update(milestones)
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

    // Revalidate paths
    revalidatePath('/mandor')
    revalidatePath(`/mandor/proyek/${milestone.proyekId}`)

    return {
      success: true,
      data: updatedMilestone,
      message: 'Milestone berhasil diperbarui'
    }
  } catch (error) {
    console.error('Error updating milestone from form:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui milestone'
    }
  }
}

/**
 * Delete Milestone
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

    // Delete milestone
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
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
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
    } else if (status === 'Dibatalkan' || status === 'Belum Dimulai') {
      // Reset dates if cancelled or back to not started
      updateData.mulai = null
      updateData.selesai = null
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