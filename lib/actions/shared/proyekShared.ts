// lib/actions/shared/proyekShared.ts
'use server'

import { db } from '@/lib/db'
import { projeks, users, testimonis, milestones, notaBelanjas, bahanHarians } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { UserRole  } from '@/lib/utils/sharedRoles'

export interface ProyekData {
  id: string
  nama: string
  tipeLayanan: string
  deskripsi: string
  alamat: string
  status: string
  progress: number
  tanggalMulai: Date | string
  tanggalSelesai: Date | string | null
  pelangganId: string
  mandorId: string | null
  mandor: {
    id: string
    nama: string
    telpon: string | null
    email: string | null
  } | null
  pelanggan?: {
    id: string
    nama: string
    telpon: string | null
  }
  hasTestimoni: boolean
  lastUpdate: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * 🔄 REAL-TIME PROGRESS CALCULATION
 * Menghitung progress langsung dari milestone yang ada di database.
 * Ini menjamin data yang dilihat klien selalu akurat, tidak peduli status field 'progress' di tabel proyek.
 */
async function calculateRealTimeProgress(proyekId: string): Promise<number> {
  try {
    const milestoneList = await db
      .select({
        status: milestones.status
      })
      .from(milestones)
      .where(eq(milestones.proyekId, proyekId))

    // Filter milestone yang aktif (tidak dibatalkan)
    const activeMilestones = milestoneList.filter(m => m.status !== 'Dibatalkan')
    const total = activeMilestones.length
    
    if (total === 0) return 0

    const completed = activeMilestones.filter(m => m.status === 'Selesai').length
    
    // Hitung persentase
    return Math.round((completed / total) * 100)
  } catch (error) {
    console.error('Error calculating progress:', error)
    return 0
  }
}

/**
 * Get project by ID - Shared access for mandor and pelanggan
 */
export async function getProyekById(id: string, userId: string, role: UserRole) {
  try {
    if (!id || !userId) {
      return { success: false, error: 'Invalid parameters', data: null }
    }

    // Get project with relations
    const result = await db
      .select({
        projek: projeks,
        mandor: {
          id: sql<string>`mandor_user.id`,
          nama: sql<string>`mandor_user.nama`,
          telpon: sql<string | null>`mandor_user.telpon`,
          email: sql<string | null>`mandor_user.email`
        },
        pelanggan: {
          id: sql<string>`pelanggan_user.id`,
          nama: sql<string>`pelanggan_user.nama`,
          telpon: sql<string | null>`pelanggan_user.telpon`
        },
        hasTestimoni: sql<boolean>`EXISTS(
          SELECT 1 FROM ${testimonis} 
          WHERE ${testimonis.proyekId} = ${projeks.id}
          AND ${testimonis.userId} = ${userId}
        )`
      })
      .from(projeks)
      .innerJoin(
        sql`${users} AS pelanggan_user`,
        sql`${projeks.pelangganId} = pelanggan_user.id`
      )
      .leftJoin(
        sql`${users} AS mandor_user`,
        sql`${projeks.mandorId} = mandor_user.id`
      )
      .where(eq(projeks.id, id))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: 'Project not found', data: null }
    }

    const row = result[0]

    // 🛡️ SECURITY CHECK
    // Pastikan user berhak melihat proyek ini
    if (role === 'pelanggan' && row.projek.pelangganId !== userId) {
        return { success: false, error: 'Unauthorized Access', data: null }
    }
    if (role === 'mandor' && row.projek.mandorId !== userId) {
        return { success: false, error: 'Unauthorized Access', data: null }
    }

    // 🔥 FORCE SYNC ON READ
    // Hitung progress secara real-time saat data diambil
    const realTimeProgress = await calculateRealTimeProgress(id)
    
    // Gunakan nilai real-time ini untuk display
    // Jika berbeda dengan DB, kita bisa trigger update (opsional, tapi untuk display kita pakai yang real-time)
    const displayProgress = realTimeProgress;

    // Log untuk debugging jika ada perbedaan
    if (displayProgress !== row.projek.progress) {
      console.warn(`  Progress Mismatch for Project ${id}: DB=${row.projek.progress}%, Real-time=${displayProgress}%`)
      // Self-healing: Update DB secara diam-diam (fire and forget)
      // await db.update(projeks).set({ progress: displayProgress }).where(eq(projeks.id, id))
    }

    // Format response
    const proyekData: ProyekData = {
      id: row.projek.id,
      nama: row.projek.nama,
      tipeLayanan: row.projek.tipeLayanan,
      deskripsi: row.projek.deskripsi,
      alamat: row.projek.alamat,
      status: row.projek.status,
      progress: displayProgress, //  Use calculated progress
      tanggalMulai: row.projek.mulai,
      tanggalSelesai: row.projek.selesai,
      pelangganId: row.projek.pelangganId,
      mandorId: row.projek.mandorId,
      mandor: row.projek.mandorId && row.mandor?.id ? {
        id: row.mandor.id,
        nama: row.mandor.nama,
        telpon: row.mandor.telpon,
        email: row.mandor.email
      } : null,
      pelanggan: {
        id: row.pelanggan.id,
        nama: row.pelanggan.nama,
        telpon: row.pelanggan.telpon
      },
      hasTestimoni: row.hasTestimoni,
      lastUpdate: row.projek.lastUpdate,
      createdAt: row.projek.createdAt,
      updatedAt: row.projek.updatedAt
    }

    return { success: true, data: proyekData }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch project', 
      data: null 
    }
  }
}

/**
 * Get all projects for user based on role
 */
export async function getProyekByUser(userId: string, role: UserRole) {
  try {
    const query = db
      .select({
        projek: projeks,
        mandor: {
          id: users.id,
          nama: users.nama,
          telpon: users.telpon
        }
      })
      .from(projeks)
      .leftJoin(users, eq(projeks.mandorId, users.id))
      .orderBy(desc(projeks.lastUpdate))

    // Role-based filtering
    let userProyek: { id: string }[] = []
    
    if (role === 'pelanggan') {
      userProyek = await db
        .select({ id: projeks.id })
        .from(projeks)
        .where(eq(projeks.pelangganId, userId))
    } else if (role === 'mandor') {
      userProyek = await db
        .select({ id: projeks.id })
        .from(projeks)
        .where(eq(projeks.mandorId, userId))
    } else {
      userProyek = await db
        .select({ id: projeks.id })
        .from(projeks)
    }
    const proyekIds = userProyek.map(p => p.id)

    if (proyekIds.length === 0) {
      return { success: true, data: [] }
    }    // Admin can see all projects (no filter)

    const results = await query

    // Calculate progress for each project
    const proyekList = await Promise.all(results.map(async (row) => {
      //  FORCE SYNC ON LIST VIEW TOO
      const realTimeProgress = await calculateRealTimeProgress(row.projek.id)

      return {
        id: row.projek.id,
        nama: row.projek.nama,
        tipeLayanan: row.projek.tipeLayanan,
        deskripsi: row.projek.deskripsi,
        alamat: row.projek.alamat,
        status: row.projek.status,
        progress: realTimeProgress, //  Use calculated progress
        tanggalMulai: row.projek.mulai,
        tanggalSelesai: row.projek.selesai,
        mandorId: row.projek.mandorId,
        mandor: row.mandor ? {
          id: row.mandor.id,
          nama: row.mandor.nama,
          telpon: row.mandor.telpon
        } : null,
        lastUpdate: row.projek.lastUpdate,
        createdAt: row.projek.createdAt
      }
    }))

    return { success: true, data: proyekList }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { 
      success: false, 
      error: 'Failed to fetch projects', 
      data: [] 
    }
  }
}

/**
 * Get project statistics
 */
export async function getProyekStats(proyekId: string, userId: string, role: UserRole) {
  try {
    // First verify access
    const proyekResult = await getProyekById(proyekId, userId, role)
    if (!proyekResult.success || !proyekResult.data) {
      return { 
        success: false, 
        error: proyekResult.error || 'Unauthorized',
        data: null 
      }
    }

    // Get milestone count
    const [milestoneCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(milestones)
      .where(eq(milestones.proyekId, proyekId))

    // Get nota count
    const [notaCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notaBelanjas)
      .where(eq(notaBelanjas.proyekId, proyekId))

    // Get total bahan cost
    const [bahanCost] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${bahanHarians.harga} as DECIMAL) * CAST(${bahanHarians.kuantitas} as DECIMAL)), 0)`
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId))

    return {
      success: true,
      data: {
        milestoneCount: Number(milestoneCount?.count) || 0,
        notaCount: Number(notaCount?.count) || 0,
        totalBahanCost: Number(bahanCost?.total) || 0,
        lastUpdate: proyekResult.data.lastUpdate
      }
    }
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return { 
      success: false, 
      error: 'Failed to fetch project statistics', 
      data: null 
    }
  }
}

/**
 * Check if testimoni can be added
 */
export async function canAddTestimoniToProyek(
  proyekId: string, 
  userId: string, 
  role: UserRole
) {
  try {
    const proyekResult = await getProyekById(proyekId, userId, role)
    
    if (!proyekResult.success || !proyekResult.data) {
      return { success: false, error: proyekResult.error, data: null }
    }

    const { data: proyek } = proyekResult

    // Check existing testimoni
    const existingTestimoni = await db.query.testimonis.findFirst({
      where: and(
        eq(testimonis.proyekId, proyekId),
        eq(testimonis.userId, userId)
      )
    })

    const canSubmit = 
      role === 'pelanggan' && 
      proyek.progress === 100 && 
      !existingTestimoni

    return {
      success: true,
      data: {
        canSubmit,
        hasExistingTestimoni: !!existingTestimoni,
        progress: proyek.progress,
        role
      }
    }
  } catch (error) {
    console.error('Error checking testimoni eligibility:', error)
    return { 
      success: false, 
      error: 'Failed to check testimoni eligibility', 
      data: null 
    }
  }
}