// FILE: lib/actions/mandor/dashboard.ts
// ========================================
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks, milestones, bahanHarians } from '@/lib/db/schema'
import { eq, and, count, sum, sql } from 'drizzle-orm'

/**
 * Get Dashboard Summary for Mandor
 * Returns: total projects, completed milestones, pending milestones, total expenses
 */
export async function getMandorDashboardSummary() {
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

    // Get mandor's projects
    const mandorProjects = await db.query.projeks.findMany({
      where: eq(projeks.mandorId, mandorId),
      columns: { id: true }
    })

    const projectIds = mandorProjects.map(p => p.id)

    // Parallel queries for better performance
    const [
      totalProjects,
      completedProjects,
      inProgressProjects,
      totalMilestones,
      completedMilestones,
      inProgressMilestones,
      totalExpenses
    ] = await Promise.all([
      // Total projects
      db.select({ count: count() })
        .from(projeks)
        .where(eq(projeks.mandorId, mandorId)),
      
      // Completed projects
      db.select({ count: count() })
        .from(projeks)
        .where(and(
          eq(projeks.mandorId, mandorId),
          eq(projeks.status, 'Selesai')
        )),
      
      // In progress projects
      db.select({ count: count() })
        .from(projeks)
        .where(and(
          eq(projeks.mandorId, mandorId),
          eq(projeks.status, 'Dalam Progress')
        )),

      // Total milestones across all projects
      projectIds.length > 0
        ? db.select({ count: count() })
            .from(milestones)
            .where(sql`${milestones.proyekId} IN ${projectIds}`)
        : Promise.resolve([{ count: 0 }]),

      // Completed milestones
      projectIds.length > 0
        ? db.select({ count: count() })
            .from(milestones)
            .where(and(
              sql`${milestones.proyekId} IN ${projectIds}`,
              eq(milestones.status, 'Selesai')
            ))
        : Promise.resolve([{ count: 0 }]),

      // In progress milestones
      projectIds.length > 0
        ? db.select({ count: count() })
            .from(milestones)
            .where(and(
              sql`${milestones.proyekId} IN ${projectIds}`,
              eq(milestones.status, 'Dalam Progress')
            ))
        : Promise.resolve([{ count: 0 }]),

      // Total expenses (bahan harians)
      projectIds.length > 0
        ? db.select({ 
            total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`
          })
          .from(bahanHarians)
          .where(sql`${bahanHarians.proyekId} IN ${projectIds}`)
        : Promise.resolve([{ total: 0 }])
    ])

    return {
      success: true,
      data: {
        projects: {
          total: totalProjects[0].count,
          completed: completedProjects[0].count,
          inProgress: inProgressProjects[0].count,
          planning: totalProjects[0].count - completedProjects[0].count - inProgressProjects[0].count
        },
        milestones: {
          total: totalMilestones[0].count,
          completed: completedMilestones[0].count,
          inProgress: inProgressMilestones[0].count,
          pending: totalMilestones[0].count - completedMilestones[0].count - inProgressMilestones[0].count
        },
        expenses: {
          total: Number(totalExpenses[0].total || 0)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return {
      success: false,
      error: 'Failed to fetch dashboard summary',
      data: null
    }
  }
}

/**
 * Get Mandor Projects with Details
 * Returns: list of projects with customer info and progress
 */
export async function getMandorProjects() {
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
      where: eq(projeks.mandorId, mandorId),
      orderBy: (projeks, { desc }) => [desc(projeks.lastUpdate)],
      with: {
        pelanggan: {
          columns: {
            id: true,
            nama: true,
            telpon: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      data: projects
    }
  } catch (error) {
    console.error('Error fetching mandor projects:', error)
    return {
      success: false,
      error: 'Failed to fetch projects',
      data: []
    }
  }
}

/**
 * Get Project Statistics per Project (for mandor dashboard cards)
 * Returns: array of projects with their individual stats
 */
export async function getProjectStatistics() {
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
      where: eq(projeks.mandorId, mandorId),
      columns: {
        id: true,
        nama: true,
        status: true,
        progress: true,
        mulai: true,
        selesai: true
      },
      with: {
        pelanggan: {
          columns: {
            nama: true
          }
        }
      }
    })

    // Get milestones and expenses for each project
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const [milestonesCount, completedMilestonesCount, totalExpenses] = await Promise.all([
          db.select({ count: count() })
            .from(milestones)
            .where(eq(milestones.proyekId, project.id)),
          
          db.select({ count: count() })
            .from(milestones)
            .where(and(
              eq(milestones.proyekId, project.id),
              eq(milestones.status, 'Selesai')
            )),
          
          db.select({ 
            total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`
          })
          .from(bahanHarians)
          .where(eq(bahanHarians.proyekId, project.id))
        ])

        return {
          ...project,
          statistics: {
            totalMilestones: milestonesCount[0].count,
            completedMilestones: completedMilestonesCount[0].count,
            milestoneProgress: milestonesCount[0].count > 0 
              ? Math.round((completedMilestonesCount[0].count / milestonesCount[0].count) * 100)
              : 0,
            totalExpenses: Number(totalExpenses[0].total || 0)
          }
        }
      })
    )

    return {
      success: true,
      data: projectStats
    }
  } catch (error) {
    console.error('Error fetching project statistics:', error)
    return {
      success: false,
      error: 'Failed to fetch project statistics',
      data: []
    }
  }
}