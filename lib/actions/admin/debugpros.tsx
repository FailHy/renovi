// FILE: lib/actions/admin/debug-progress.ts
// Tool untuk debugging dan memperbaiki progress
'use server'

import { db } from '@/lib/db'
import { projeks, milestones } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface ProgressReport {
  proyekId: string
  proyekNama: string
  currentProgress: number
  currentStatus: string
  totalMilestones: number
  completedMilestones: number
  cancelledMilestones: number
  inProgressMilestones: number
  belumDimulaiMilestones: number
  calculatedProgress: number
  calculatedStatus: string
  needsUpdate: boolean
  milestoneDetails: Array<{
    id: string
    nama: string
    status: string
    tanggal: string
  }>
}

/**
 * Get detailed progress report for a project
 */
export async function getProgressReport(proyekId: string): Promise<{
  success: boolean
  data?: ProgressReport
  error?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get project
    const project = await db.query.projeks.findFirst({
      where: eq(projeks.id, proyekId),
    })

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    // Get milestones
    const projectMilestones = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, proyekId),
      orderBy: (milestones, { asc }) => [asc(milestones.tanggal)]
    })

    // Calculate statistics
    const total = projectMilestones.length
    const completed = projectMilestones.filter(m => m.status === 'Selesai').length
    const cancelled = projectMilestones.filter(m => m.status === 'Dibatalkan').length
    const inProgress = projectMilestones.filter(m => m.status === 'Dalam Progress').length
    const belumDimulai = projectMilestones.filter(m => m.status === 'Belum Dimulai').length

    // Calculate expected progress
    const effectiveTotal = total - cancelled
    let calculatedProgress = 0
    if (effectiveTotal > 0) {
      calculatedProgress = Math.round((completed / effectiveTotal) * 100)
    }

    // Calculate expected status
    let calculatedStatus: string = 'Perencanaan'
    if (effectiveTotal > 0 && completed === effectiveTotal) {
      calculatedStatus = 'Selesai'
    } else if (cancelled === total) {
      calculatedStatus = 'Dibatalkan'
    } else if (completed === 0 && inProgress === 0) {
      calculatedStatus = 'Perencanaan'
    } else {
      calculatedStatus = 'Dalam Progress'
    }

    const needsUpdate = 
      project.progress !== calculatedProgress || 
      project.status !== calculatedStatus

    const report: ProgressReport = {
      proyekId: project.id,
      proyekNama: project.nama,
      currentProgress: project.progress,
      currentStatus: project.status,
      totalMilestones: total,
      completedMilestones: completed,
      cancelledMilestones: cancelled,
      inProgressMilestones: inProgress,
      belumDimulaiMilestones: belumDimulai,
      calculatedProgress,
      calculatedStatus,
      needsUpdate,
      milestoneDetails: projectMilestones.map(m => ({
        id: m.id,
        nama: m.nama,
        status: m.status,
        tanggal: m.tanggal.toISOString()
      }))
    }

    return { success: true, data: report }
  } catch (error) {
    console.error('Error getting progress report:', error)
    return { success: false, error: 'Failed to get progress report' }
  }
}

/**
 * Get all projects that need progress update
 */
export async function getAllProjectsNeedingUpdate(): Promise<{
  success: boolean
  data?: ProgressReport[]
  error?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const allProjects = await db.query.projeks.findMany({
      with: {
        milestones: true
      }
    })

    const reports: ProgressReport[] = []

    for (const project of allProjects) {
      const total = project.milestones.length
      const completed = project.milestones.filter(m => m.status === 'Selesai').length
      const cancelled = project.milestones.filter(m => m.status === 'Dibatalkan').length
      const inProgress = project.milestones.filter(m => m.status === 'Dalam Progress').length
      const belumDimulai = project.milestones.filter(m => m.status === 'Belum Dimulai').length

      const effectiveTotal = total - cancelled
      let calculatedProgress = 0
      if (effectiveTotal > 0) {
        calculatedProgress = Math.round((completed / effectiveTotal) * 100)
      }

      let calculatedStatus: string = 'Perencanaan'
      if (effectiveTotal > 0 && completed === effectiveTotal) {
        calculatedStatus = 'Selesai'
      } else if (cancelled === total) {
        calculatedStatus = 'Dibatalkan'
      } else if (completed === 0 && inProgress === 0) {
        calculatedStatus = 'Perencanaan'
      } else {
        calculatedStatus = 'Dalam Progress'
      }

      const needsUpdate = 
        project.progress !== calculatedProgress || 
        project.status !== calculatedStatus

      if (needsUpdate) {
        reports.push({
          proyekId: project.id,
          proyekNama: project.nama,
          currentProgress: project.progress,
          currentStatus: project.status,
          totalMilestones: total,
          completedMilestones: completed,
          cancelledMilestones: cancelled,
          inProgressMilestones: inProgress,
          belumDimulaiMilestones: belumDimulai,
          calculatedProgress,
          calculatedStatus,
          needsUpdate,
          milestoneDetails: project.milestones.map(m => ({
            id: m.id,
            nama: m.nama,
            status: m.status,
            tanggal: m.tanggal.toISOString()
          }))
        })
      }
    }

    return { success: true, data: reports }
  } catch (error) {
    console.error('Error getting projects needing update:', error)
    return { success: false, error: 'Failed to get projects' }
  }
}

/**
 * Fix progress for a specific project
 */
export async function fixProjectProgress(proyekId: string): Promise<{
  success: boolean
  message?: string
  error?: string
  before?: { progress: number; status: string }
  after?: { progress: number; status: string }
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get current state
    const project = await db.query.projeks.findFirst({
      where: eq(projeks.id, proyekId),
    })

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    const before = {
      progress: project.progress,
      status: project.status
    }

    // Calculate new values
    const projectMilestones = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, proyekId),
    })

    const total = projectMilestones.length
    const completed = projectMilestones.filter(m => m.status === 'Selesai').length
    const cancelled = projectMilestones.filter(m => m.status === 'Dibatalkan').length
    const inProgress = projectMilestones.filter(m => m.status === 'Dalam Progress').length

    const effectiveTotal = total - cancelled
    let progress = 0
    if (effectiveTotal > 0) {
      progress = Math.round((completed / effectiveTotal) * 100)
    }

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

    // Update database
    const updateData: any = {
      progress,
      status: newStatus,
      lastUpdate: new Date(),
      updatedAt: new Date(),
    }

    if (newStatus === 'Selesai' && !project.selesai) {
      updateData.selesai = new Date()
    } else if (newStatus !== 'Selesai') {
      updateData.selesai = null
    }

    await db.update(projeks)
      .set(updateData)
      .where(eq(projeks.id, proyekId))

    revalidatePath('/admin/proyek')
    revalidatePath(`/admin/proyek/${proyekId}`)

    return {
      success: true,
      message: `Progress updated: ${before.progress}% → ${progress}%, Status: ${before.status} → ${newStatus}`,
      before,
      after: {
        progress,
        status: newStatus
      }
    }
  } catch (error) {
    console.error('Error fixing project progress:', error)
    return { success: false, error: 'Failed to fix progress' }
  }
}

/**
 * Fix all projects with incorrect progress
 */
export async function fixAllProjectsProgress(): Promise<{
  success: boolean
  message?: string
  error?: string
  fixed?: number
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const needsUpdate = await getAllProjectsNeedingUpdate()
    if (!needsUpdate.success || !needsUpdate.data) {
      return { success: false, error: 'Failed to get projects' }
    }

    let fixed = 0
    for (const report of needsUpdate.data) {
      const result = await fixProjectProgress(report.proyekId)
      if (result.success) {
        fixed++
      }
    }

    revalidatePath('/admin/proyek')

    return {
      success: true,
      message: `Fixed ${fixed} projects out of ${needsUpdate.data.length}`,
      fixed
    }
  } catch (error) {
    console.error('Error fixing all projects:', error)
    return { success: false, error: 'Failed to fix all projects' }
  }
}