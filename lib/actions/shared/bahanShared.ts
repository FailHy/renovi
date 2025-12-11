// lib/actions/shared/bahan.ts
'use server'

import { db } from '@/lib/db'
import { bahanHarians, notaBelanjas, milestones } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { UserRole } from '@/lib/utils/sharedRoles'
import { getProyekById } from './proyekShared'

export interface BahanWithRelations {
  id: string
  notaId: string
  proyekId: string
  milestoneId: string | null
  nama: string
  deskripsi: string | null
  harga: string
  kuantitas: string
  satuan: string
  kategori: string | null
  status: string
  gambar: string[] | null
  createdAt: Date
  updatedAt: Date
  nota?: {
    id: string
    nomorNota: string | null
    namaToko: string | null
    tanggalBelanja: Date
  }
  milestone?: {
    id: string
    nama: string
  } | null
}

/**
 * Get all bahan for a project
 */
export async function getBahanByProyekId(
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
        error: proyekResult.error || 'Unauthorized',
        data: [] 
      }
    }

    const bahanList = await db
      .select({
        bahan: bahanHarians,
        nota: {
          id: notaBelanjas.id,
          nomorNota: notaBelanjas.nomorNota,
          namaToko: notaBelanjas.namaToko,
          tanggalBelanja: notaBelanjas.tanggalBelanja
        },
        milestone: {
          id: milestones.id,
          nama: milestones.nama
        }
      })
      .from(bahanHarians)
      .innerJoin(notaBelanjas, eq(bahanHarians.notaId, notaBelanjas.id))
      .leftJoin(milestones, eq(bahanHarians.milestoneId, milestones.id))
      .where(eq(bahanHarians.proyekId, proyekId))
      .orderBy(desc(notaBelanjas.tanggalBelanja), desc(bahanHarians.createdAt))

    // Transform to desired format
    const bahanWithRelations: BahanWithRelations[] = bahanList.map(item => ({
      ...item.bahan,
      nota: item.nota,
      milestone: item.milestone
    }))

    return { success: true, data: bahanWithRelations }
  } catch (error) {
    console.error('Error fetching bahan:', error)
    return { 
      success: false, 
      error: 'Failed to fetch bahan', 
      data: [] 
    }
  }
}

/**
 * Get bahan grouped by nota
 */
export async function getBahanGroupedByNota(
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
        error: proyekResult.error || 'Unauthorized',
        data: [] 
      }
    }

    const grouped = await db
      .select({
        notaId: notaBelanjas.id,
        nomorNota: notaBelanjas.nomorNota,
        namaToko: notaBelanjas.namaToko,
        tanggalBelanja: notaBelanjas.tanggalBelanja,
        fotoNotaUrl: notaBelanjas.fotoNotaUrl,
        totalItems: sql<number>`COUNT(${bahanHarians.id})`,
        totalCost: sql<number>`COALESCE(SUM(CAST(${bahanHarians.harga} as DECIMAL) * CAST(${bahanHarians.kuantitas} as DECIMAL)), 0)`,
        items: sql<any[]>`json_agg(
          jsonb_build_object(
            'id', ${bahanHarians.id},
            'nama', ${bahanHarians.nama},
            'deskripsi', ${bahanHarians.deskripsi},
            'harga', CAST(${bahanHarians.harga} as DECIMAL),
            'kuantitas', CAST(${bahanHarians.kuantitas} as DECIMAL),
            'satuan', ${bahanHarians.satuan},
            'kategori', ${bahanHarians.kategori},
            'status', ${bahanHarians.status},
            'gambar', ${bahanHarians.gambar},
            'milestoneId', ${bahanHarians.milestoneId},
            'createdAt', ${bahanHarians.createdAt}
          ) ORDER BY ${bahanHarians.createdAt}
        )`
      })
      .from(notaBelanjas)
      .innerJoin(bahanHarians, eq(bahanHarians.notaId, notaBelanjas.id))
      .where(eq(notaBelanjas.proyekId, proyekId))
      .groupBy(
        notaBelanjas.id,
        notaBelanjas.nomorNota, 
        notaBelanjas.namaToko, 
        notaBelanjas.tanggalBelanja,
        notaBelanjas.fotoNotaUrl
      )
      .orderBy(desc(notaBelanjas.tanggalBelanja))

    return { success: true, data: grouped }
  } catch (error) {
    console.error('Error grouping bahan by nota:', error)
    return { 
      success: false, 
      error: 'Failed to group bahan', 
      data: [] 
    }
  }
}

/**
 * Get bahan statistics
 */
export async function getBahanStats(
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

    const [totalCost, totalItems, byStatus, byKategori] = await Promise.all([
      // Total cost
      db.select({ 
        total: sql<number>`COALESCE(SUM(CAST(${bahanHarians.harga} as DECIMAL) * CAST(${bahanHarians.kuantitas} as DECIMAL)), 0)` 
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId)),
      
      // Total items
      db.select({ 
        total: sql<number>`COUNT(*)` 
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId)),
      
      // By status
      db.select({
        status: bahanHarians.status,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(CAST(${bahanHarians.harga} as DECIMAL) * CAST(${bahanHarians.kuantitas} as DECIMAL)), 0)`
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId))
      .groupBy(bahanHarians.status),
      
      // By kategori
      db.select({
        kategori: bahanHarians.kategori,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(CAST(${bahanHarians.harga} as DECIMAL) * CAST(${bahanHarians.kuantitas} as DECIMAL)), 0)`
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId))
      .groupBy(bahanHarians.kategori)
    ])
    
    return {
      success: true,
      data: {
        totalCost: Number(totalCost[0]?.total) || 0,
        totalItems: Number(totalItems[0]?.total) || 0,
        byStatus: byStatus.map(item => ({
          status: item.status,
          count: Number(item.count),
          total: Number(item.total) || 0
        })),
        byKategori: byKategori.map(item => ({
          kategori: item.kategori || 'Tanpa Kategori',
          count: Number(item.count),
          total: Number(item.total) || 0
        }))
      }
    }
  } catch (error) {
    console.error('Error getting bahan summary:', error)
    return { 
      success: false, 
      error: 'Failed to get bahan statistics', 
      data: null 
    }
  }
}

/**
 * Get bahan by milestone
 */
export async function getBahanByMilestoneId(
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
      return { success: false, error: 'Milestone not found', data: [] }
    }

    // Verify project access
    const proyekResult = await getProyekById(milestone.proyekId, userId, role)
    if (!proyekResult.success) {
      return { 
        success: false, 
        error: proyekResult.error || 'Unauthorized',
        data: [] 
      }
    }

    const bahanList = await db.query.bahanHarians.findMany({
      where: eq(bahanHarians.milestoneId, milestoneId),
      with: {
        nota: {
          columns: {
            id: true,
            nomorNota: true,
            namaToko: true,
            tanggalBelanja: true
          }
        }
      },
      orderBy: [desc(bahanHarians.createdAt)]
    })

    return { success: true, data: bahanList }
  } catch (error) {
    console.error('Error fetching bahan by milestone:', error)
    return { 
      success: false, 
      error: 'Failed to fetch bahan', 
      data: [] 
    }
  }
}

/**
 * Get bahan by status
 */
export async function getBahanByStatus(
  proyekId: string, 
  status: string, 
  userId: string, 
  role: UserRole
) {
  try {
    // Verify project access
    const proyekResult = await getProyekById(proyekId, userId, role)
    if (!proyekResult.success) {
      return { 
        success: false, 
        error: proyekResult.error || 'Unauthorized',
        data: [] 
      }
    }

    const bahanList = await db.query.bahanHarians.findMany({
      where: and(
        eq(bahanHarians.proyekId, proyekId),
        eq(bahanHarians.status, status)
      ),
      with: {
        nota: {
          columns: {
            id: true,
            nomorNota: true,
            namaToko: true,
            tanggalBelanja: true
          }
        },
        milestone: {
          columns: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: [desc(bahanHarians.createdAt)]
    })

    return { success: true, data: bahanList }
  } catch (error) {
    console.error('Error fetching bahan by status:', error)
    return { 
      success: false, 
      error: 'Failed to fetch bahan', 
      data: [] 
    }
  }
}