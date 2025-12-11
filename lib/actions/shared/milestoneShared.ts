// lib/actions/shared/milestone.ts
'use server'

import { db } from '@/lib/db'
import { milestones, projeks } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { UserRole } from '@/lib/utils/sharedRoles'
import { getProyekById } from './proyekShared'

export interface MilestoneData {
  id: string
  proyekId: string
  nama: string
  deskripsi: string | null
  gambar: string[] | null
  status: string
  tanggal: Date
  mulai: Date | null
  selesai: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Get milestones for a project - Shared read access
 */
export async function getMilestonesByProyekId(
  proyekId: string, 
  userId: string, 
  role: UserRole
) {
  try {
    // First verify project access
    const proyekResult = await getProyekById(proyekId, userId, role)
    if (!proyekResult.success) {
      return { 
        success: false, 
        error: proyekResult.error || 'Unauthorized',
        data: [] 
      }
    }

    const milestoneList = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, proyekId),
      orderBy: [asc(milestones.tanggal)],
    })

    return { 
      success: true, 
      data: milestoneList as MilestoneData[]
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
 * Get milestone by ID with project access check
 */
export async function getMilestoneById(
  milestoneId: string, 
  userId: string, 
  role: UserRole
) {
  try {
    // Get milestone with project info
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        projek: true
      }
    })

    if (!milestone) {
      return { success: false, error: 'Milestone not found', data: null }
    }

    // Verify project access
    const proyekResult = await getProyekById(milestone.proyekId, userId, role)
    if (!proyekResult.success) {
      return { 
        success: false, 
        error: proyekResult.error || 'Unauthorized',
        data: null 
      }
    }

    return { 
      success: true, 
      data: milestone as MilestoneData
    }
  } catch (error) {
    console.error('Error fetching milestone:', error)
    return { 
      success: false, 
      error: 'Failed to fetch milestone', 
      data: null 
    }
  }
}

/**
 * Get milestone statistics
 */
export async function getMilestoneStats(
  proyekId: string, 
  userId: string, 
  role: UserRole
) {
  try {
    // Verify project access
    const proyekResult = await getProyekById(proyekId, userId, role)
    if (!proyekResult.success) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: null 
      }
    }

    const allMilestones = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, proyekId),
    })

    const stats = {
      total: allMilestones.length,
      belumDimulai: allMilestones.filter(m => m.status === 'Belum Dimulai').length,
      dalamProgress: allMilestones.filter(m => m.status === 'Dalam Progress').length,
      selesai: allMilestones.filter(m => m.status === 'Selesai').length,
      dibatalkan: allMilestones.filter(m => m.status === 'Dibatalkan').length,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching milestone stats:', error)
    return { 
      success: false, 
      error: 'Failed to fetch milestone statistics', 
      data: null 
    }
  }
}

/**
 * Get upcoming milestones
 */
export async function getUpcomingMilestones(
  userId: string, 
  role: UserRole,
  limit: number = 5
) {
  try {
    // Get user's projects based on role
    let pQ = db
      .select({ id: projeks.id })
      .from(projeks)
    
    if (role === 'pelanggan') {
      pQ = pQ.where(eq(projeks.pelangganId, userId))
    } else if (role === 'mandor') {
      pQ = pQ.where(eq(projeks.mandorId, userId))
    }

    const userProyek = await pQ
    const proyekIds = userProyek.map(p => p.id)

    if (proyekIds.length === 0) {
      return { success: true, data: [] }
    }

    const upcoming = await db.query.milestones.findMany({
      where: (milestones, { inArray, and, gte }) => 
        and(
          inArray(milestones.proyekId, proyekIds),
          gte(milestones.tanggal, new Date())
        ),
      orderBy: [asc(milestones.tanggal)],
      limit,
      with: {
        projek: {
          columns: {
            id: true,
            nama: true
          }
        }
      }
    })

    return { success: true, data: upcoming }
  } catch (error) {
    console.error('Error fetching upcoming milestones:', error)
    return { 
      success: false, 
      error: 'Failed to fetch upcoming milestones', 
      data: [] 
    }
  }
}