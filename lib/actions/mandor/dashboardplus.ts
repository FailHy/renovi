// FILE: lib/actions/mandor/dashboard-enhanced.ts
// ========================================
// Enhanced Dashboard dengan statistik lebih detail dan visualisasi data
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks, milestones, bahanHarians } from '@/lib/db/schema'
import { eq, and, count, sum, sql, gte, lte } from 'drizzle-orm'

/**
 * Get Detailed Project Performance Statistics
 * Returns comprehensive project metrics for mandor dashboard
 */
export async function getProjectPerformanceStats() {
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

    // Get all projects with detailed info
    const allProjects = await db.query.projeks.findMany({
      where: eq(projeks.mandorId, mandorId),
      with: {
        pelanggan: {
          columns: {
            nama: true
          }
        }
      }
    })

    // Calculate statistics for each project
    const projectStats = await Promise.all(
      allProjects.map(async (project) => {
        const [milestonesData, expensesData] = await Promise.all([
          // Milestone stats
          db.select({ 
            total: count(),
            status: milestones.status
          })
          .from(milestones)
          .where(eq(milestones.proyekId, project.id))
          .groupBy(milestones.status),

          // Expense stats
          db.select({ 
            total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`,
            count: count()
          })
          .from(bahanHarians)
          .where(eq(bahanHarians.proyekId, project.id))
        ])

        // Calculate milestone completion rate
        const totalMilestones = milestonesData.reduce((acc, m) => acc + m.total, 0)
        const completedMilestones = milestonesData.find(m => m.status === 'Selesai')?.total || 0
        const milestoneCompletionRate = totalMilestones > 0 
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0

        // Calculate project health score (based on progress vs milestones)
        const progressVsMilestones = totalMilestones > 0
          ? Math.abs(project.progress - milestoneCompletionRate)
          : 0
        
        let healthScore = 'Baik'
        let healthColor = 'green'
        
        if (progressVsMilestones > 30) {
          healthScore = 'Perlu Perhatian'
          healthColor = 'red'
        } else if (progressVsMilestones > 15) {
          healthScore = 'Cukup'
          healthColor = 'yellow'
        }

        // Calculate days since last update
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(project.lastUpdate).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Calculate project duration
        const startDate = new Date(project.mulai)
        const endDate = project.selesai ? new Date(project.selesai) : new Date()
        const durationDays = Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        return {
          id: project.id,
          nama: project.nama,
          pelanggan: project.pelanggan.nama,
          status: project.status,
          progress: project.progress,
          milestones: {
            total: totalMilestones,
            completed: completedMilestones,
            inProgress: milestonesData.find(m => m.status === 'Dalam Progress')?.total || 0,
            pending: milestonesData.find(m => m.status === 'Belum Dimulai')?.total || 0,
            completionRate: milestoneCompletionRate
          },
          expenses: {
            total: Number(expensesData[0]?.total || 0),
            itemCount: expensesData[0]?.count || 0
          },
          health: {
            score: healthScore,
            color: healthColor,
            progressVsMilestones
          },
          timeline: {
            startDate: project.mulai,
            endDate: project.selesai,
            durationDays,
            daysSinceUpdate
          }
        }
      })
    )

    // Calculate overall statistics
    const totalProjects = projectStats.length
    const avgProgress = totalProjects > 0
      ? Math.round(projectStats.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
      : 0
    
    const totalExpenses = projectStats.reduce((acc, p) => acc + p.expenses.total, 0)
    const avgExpensePerProject = totalProjects > 0
      ? Math.round(totalExpenses / totalProjects)
      : 0

    const projectsNeedingAttention = projectStats.filter(
      p => p.health.score === 'Perlu Perhatian' || p.timeline.daysSinceUpdate > 7
    ).length

    return {
      success: true,
      data: {
        overview: {
          totalProjects,
          avgProgress,
          totalExpenses,
          avgExpensePerProject,
          projectsNeedingAttention
        },
        projects: projectStats,
        recommendations: generateRecommendations(projectStats)
      }
    }
  } catch (error) {
    console.error('Error fetching project performance stats:', error)
    return {
      success: false,
      error: 'Failed to fetch project performance statistics',
      data: null
    }
  }
}

/**
 * Generate smart recommendations based on project data
 */
function generateRecommendations(projectStats: any[]) {
  const recommendations = []

  // Check for stale projects
  const staleProjects = projectStats.filter(p => p.timeline.daysSinceUpdate > 7)
  if (staleProjects.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Proyek Perlu Update',
      message: `${staleProjects.length} proyek belum diupdate lebih dari 7 hari`,
      projects: staleProjects.map(p => ({ id: p.id, nama: p.nama }))
    })
  }

  // Check for low progress projects
  const lowProgressProjects = projectStats.filter(
    p => p.status === 'Dalam Progress' && p.progress < 30
  )
  if (lowProgressProjects.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'Progress Rendah',
      message: `${lowProgressProjects.length} proyek memiliki progress di bawah 30%`,
      projects: lowProgressProjects.map(p => ({ id: p.id, nama: p.nama, progress: p.progress }))
    })
  }

  // Check for projects with milestone mismatch
  const mismatchProjects = projectStats.filter(
    p => p.health.progressVsMilestones > 20
  )
  if (mismatchProjects.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Progress Tidak Sesuai Milestone',
      message: `${mismatchProjects.length} proyek memiliki perbedaan signifikan antara progress dan milestone`,
      projects: mismatchProjects.map(p => ({ 
        id: p.id, 
        nama: p.nama, 
        progress: p.progress,
        milestoneCompletion: p.milestones.completionRate
      }))
    })
  }

  // Check for projects nearing completion
  const nearingCompletion = projectStats.filter(
    p => p.status === 'Dalam Progress' && p.progress >= 80
  )
  if (nearingCompletion.length > 0) {
    recommendations.push({
      type: 'success',
      title: 'Proyek Hampir Selesai',
      message: `${nearingCompletion.length} proyek sudah mencapai 80% atau lebih`,
      projects: nearingCompletion.map(p => ({ id: p.id, nama: p.nama, progress: p.progress }))
    })
  }

  return recommendations
}

/**
 * Get Monthly Activity Summary
 * Returns activity data for the current month
 */
export async function getMonthlyActivitySummary() {
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

    // Get current month start and end
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get projects
    const mandorProjects = await db.query.projeks.findMany({
      where: eq(projeks.mandorId, mandorId),
      columns: { id: true }
    })

    const projectIds = mandorProjects.map(p => p.id)

    if (projectIds.length === 0) {
      return {
        success: true,
        data: {
          milestonesCompleted: 0,
          milestonesCreated: 0,
          expensesAdded: 0,
          totalExpensesAmount: 0
        }
      }
    }

    // Get monthly activity
    const [milestonesCompleted, milestonesCreated, expensesAdded] = await Promise.all([
      // Milestones completed this month
      db.select({ count: count() })
        .from(milestones)
        .where(and(
          sql`${milestones.proyekId} IN ${projectIds}`,
          eq(milestones.status, 'Selesai'),
          gte(milestones.selesai, monthStart),
          lte(milestones.selesai, monthEnd)
        )),

      // Milestones created this month
      db.select({ count: count() })
        .from(milestones)
        .where(and(
          sql`${milestones.proyekId} IN ${projectIds}`,
          gte(milestones.createdAt, monthStart),
          lte(milestones.createdAt, monthEnd)
        )),

      // Expenses added this month
      db.select({ 
        count: count(),
        total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`
      })
        .from(bahanHarians)
        .where(and(
          sql`${bahanHarians.proyekId} IN ${projectIds}`,
          gte(bahanHarians.tanggal, monthStart),
          lte(bahanHarians.tanggal, monthEnd)
        ))
    ])

    return {
      success: true,
      data: {
        milestonesCompleted: milestonesCompleted[0].count,
        milestonesCreated: milestonesCreated[0].count,
        expensesAdded: expensesAdded[0].count,
        totalExpensesAmount: Number(expensesAdded[0].total || 0)
      }
    }
  } catch (error) {
    console.error('Error fetching monthly activity:', error)
    return {
      success: false,
      error: 'Failed to fetch monthly activity',
      data: null
    }
  }
}

/**
 * Get Project Comparison Data
 * Compare all projects side by side
 */
export async function getProjectComparison() {
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
      }
    })

    const comparison = await Promise.all(
      projects.map(async (project) => {
        const [milestoneCount, expenseTotal] = await Promise.all([
          db.select({ count: count() })
            .from(milestones)
            .where(eq(milestones.proyekId, project.id)),
          
          db.select({ 
            total: sql<number>`COALESCE(SUM(${bahanHarians.harga} * ${bahanHarians.kuantitas}), 0)`
          })
          .from(bahanHarians)
          .where(eq(bahanHarians.proyekId, project.id))
        ])

        return {
          id: project.id,
          nama: project.nama,
          status: project.status,
          progress: project.progress,
          milestones: milestoneCount[0].count,
          expenses: Number(expenseTotal[0].total || 0),
          duration: project.selesai
            ? Math.floor((new Date(project.selesai).getTime() - new Date(project.mulai).getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((Date.now() - new Date(project.mulai).getTime()) / (1000 * 60 * 60 * 24))
        }
      })
    )

    return {
      success: true,
      data: comparison
    }
  } catch (error) {
    console.error('Error fetching project comparison:', error)
    return {
      success: false,
      error: 'Failed to fetch project comparison',
      data: []
    }
  }
}