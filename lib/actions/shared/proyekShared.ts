// FILE: lib/actions/shared/proyek.ts
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
  testimoniData?: {
    id: string
    rating: number
    komentar: string
    approved: boolean
    createdAt: Date
  } | null
  lastUpdate: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Calculate project progress based on milestones
 */
async function calculateProyekProgress(proyekId: string): Promise<number> {
  try {
    const milestoneList = await db
      .select({
        total: sql<number>`COUNT(*)`,
        selesai: sql<number>`COUNT(CASE WHEN ${milestones.status} = 'Selesai' THEN 1 END)`
      })
      .from(milestones)
      .where(eq(milestones.proyekId, proyekId))

    if (milestoneList.length === 0 || milestoneList[0].total === 0) {
      return 0
    }

    const { total, selesai } = milestoneList[0]
    const progress = Math.round((Number(selesai) / Number(total)) * 100)
    
    return progress
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

    // ✅ UPDATE: Get testimoni data juga
    const testimoniData = await db.query.testimonis.findFirst({
      where: and(
        eq(testimonis.proyekId, id),
        eq(testimonis.userId, userId)
      ),
      columns: {
        id: true,
        rating: true,
        komentar: true,
        approved: true,
        createdAt: true
      }
    })

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
        }
        // ❌ HAPUS: hasTestimoni dari SQL karena kita hitung manual
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

    // ✅ FIX: Calculate real-time progress from milestones
    const calculatedProgress = await calculateProyekProgress(id)
    
    // Use calculated progress if it's different from stored progress
    const finalProgress = calculatedProgress > 0 ? calculatedProgress : (row.projek.progress || 0)

    console.log('Progress calculation:', {
      proyekId: id,
      storedProgress: row.projek.progress,
      calculatedProgress,
      finalProgress
    })

    // ✅ FIX: hasTestimoni = testimoni ada DAN approved
    const hasTestimoni = !!testimoniData?.id && testimoniData.approved === true

    // Format response
    const proyekData: ProyekData = {
      id: row.projek.id,
      nama: row.projek.nama,
      tipeLayanan: row.projek.tipeLayanan,
      deskripsi: row.projek.deskripsi,
      alamat: row.projek.alamat,
      status: row.projek.status,
      progress: finalProgress,
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
      hasTestimoni, // ✅ Gunakan yang sudah dihitung dengan benar
      testimoniData, // ✅ Include data testimoni lengkap
      lastUpdate: row.projek.lastUpdate,
      createdAt: row.projek.createdAt,
      updatedAt: row.projek.updatedAt
    }

    console.log('Proyek data with testimoni:', {
      hasTestimoni,
      testimoniExists: !!testimoniData?.id,
      testimoniApproved: testimoniData?.approved,
      testimoniData: testimoniData
    })

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
    let query = db
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
    let pQ = db.select({ id: projeks.id }).from(projeks)
    if (role === 'pelanggan') {
      pQ = pQ.where(eq(projeks.pelangganId, userId))
    } else if (role === 'mandor') {
      pQ = pQ.where(eq(projeks.mandorId, userId))
    }
    // Admin can see all projects (no filter)

    const results = await query

    // Calculate progress for each project
    const proyekList = await Promise.all(results.map(async (row) => {
      const calculatedProgress = await calculateProyekProgress(row.projek.id)
      const finalProgress = calculatedProgress > 0 ? calculatedProgress : (row.projek.progress || 0)

      // ✅ UPDATE: Get testimoni status untuk setiap proyek
      const testimoniData = await db.query.testimonis.findFirst({
        where: and(
          eq(testimonis.proyekId, row.projek.id),
          eq(testimonis.userId, userId)
        ),
        columns: {
          id: true,
          approved: true
        }
      })

      return {
        id: row.projek.id,
        nama: row.projek.nama,
        tipeLayanan: row.projek.tipeLayanan,
        deskripsi: row.projek.deskripsi,
        alamat: row.projek.alamat,
        status: row.projek.status,
        progress: finalProgress,
        tanggalMulai: row.projek.mulai,
        tanggalSelesai: row.projek.selesai,
        mandorId: row.projek.mandorId,
        mandor: row.mandor ? {
          id: row.mandor.id,
          nama: row.mandor.nama,
          telpon: row.mandor.telpon
        } : null,
        hasTestimoni: !!testimoniData?.id && testimoniData.approved === true, // ✅
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
        testimoniApproved: existingTestimoni?.approved || false,
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