// FILE: lib/actions/mandor/bahan.ts - UPDATED FOR SIMPLIFIED SCHEMA
'use server'

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  bahanHarians, 
  milestones, 
  notaBelanjas,
  projeks 
} from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * Get all bahan for a project with complete nota information
 * This is the main function used by BahanHarianTab
 */
export async function getBahanByProject(proyekId: string, mandorId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.id !== mandorId) {
      return { success: false, error: 'Unauthorized', data: [] }
    }

    // Verify project belongs to mandor
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, proyekId),
        eq(projeks.mandorId, mandorId)
      )
    })

    if (!project) {
      return { success: false, error: 'Project not found', data: [] }
    }

    // Get all bahan with nota and milestone information
    const bahan = await db
      .select({
        id: bahanHarians.id,
        nama: bahanHarians.nama,
        deskripsi: bahanHarians.deskripsi,
        harga: bahanHarians.harga,
        kuantitas: bahanHarians.kuantitas,
        satuan: bahanHarians.satuan,
        kategori: bahanHarians.kategori,
        status: bahanHarians.status,
        gambar: bahanHarians.gambar,
        createdAt: bahanHarians.createdAt,
        notaId: bahanHarians.notaId,
        // Nota information
        nota: sql<{
          id: string
          nomorNota: string | null
          namaToko: string | null
          tanggalBelanja: Date
          fotoNotaUrl: string
        }>`jsonb_build_object(
          'id', ${notaBelanjas.id},
          'nomorNota', ${notaBelanjas.nomorNota},
          'namaToko', ${notaBelanjas.namaToko},
          'tanggalBelanja', ${notaBelanjas.tanggalBelanja},
          'fotoNotaUrl', ${notaBelanjas.fotoNotaUrl}
        )`,
        // Milestone information (optional)
        milestone: sql<{
          id: string
          nama: string
        } | null>`CASE 
          WHEN ${milestones.id} IS NOT NULL THEN
            jsonb_build_object(
              'id', ${milestones.id},
              'nama', ${milestones.nama}
            )
          ELSE NULL
        END`
      })
      .from(bahanHarians)
      .innerJoin(notaBelanjas, eq(bahanHarians.notaId, notaBelanjas.id))
      .leftJoin(milestones, eq(bahanHarians.milestoneId, milestones.id))
      .where(eq(bahanHarians.proyekId, proyekId))
      .orderBy(desc(notaBelanjas.tanggalBelanja), desc(bahanHarians.createdAt))
    
    return { success: true, data: bahan }
  } catch (error) {
    console.error('Error fetching bahan by project:', error)
    return { success: false, error: 'Gagal memuat data bahan', data: [] }
  }
}

/**
 * Get bahan masuk (legacy function name for backward compatibility)
 */
export async function getBahanMasukByProyek(proyekId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized', data: [] }
  }

  return getBahanByProject(proyekId, session.user.id)
}

/**
 * Update bahan status
 * Allows changing status of existing bahan (e.g., Digunakan -> Sisa)
 */
export async function updateBahanStatus(
  bahanId: string,
  status: 'Digunakan' | 'Sisa' | 'Rusak'
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const mandorId = session.user.id

    // Get bahan with project info
    const bahan = await db.query.bahanHarians.findFirst({
      where: eq(bahanHarians.id, bahanId),
      with: {
        projek: true
      }
    })

    if (!bahan) {
      return { success: false, error: 'Bahan not found' }
    }

    if (bahan.projek.mandorId !== mandorId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update status
    const [updated] = await db
      .update(bahanHarians)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(bahanHarians.id, bahanId))
      .returning()

    revalidatePath(`/mandor/proyek/${bahan.proyekId}`)
    
    return { 
      success: true, 
      data: updated,
      message: 'Status bahan berhasil diupdate'
    }
  } catch (error: any) {
    console.error('Error updating bahan status:', error)
    return { 
      success: false, 
      error: error.message || 'Gagal mengupdate status bahan' 
    }
  }
}

/**
 * Get total bahan cost for project
 */
export async function getTotalBahanCost(proyekId: string) {
  try {
    const result = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${bahanHarians.harga} as DECIMAL) * CAST(${bahanHarians.kuantitas} as DECIMAL)), 0)`
      })
      .from(bahanHarians)
      .where(eq(bahanHarians.proyekId, proyekId))
    
    return Number(result[0]?.total) || 0
  } catch (error) {
    console.error('Error calculating total bahan cost:', error)
    return 0
  }
}

/**
 * Get bahan summary statistics
 */
export async function getBahanSummary(proyekId: string) {
  try {
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
      
      // By bahan status (Digunakan, Sisa, Rusak)
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
  } catch (error) {
    console.error('Error getting bahan summary:', error)
    return { 
      totalCost: 0, 
      totalItems: 0, 
      byStatus: [], 
      byKategori: []
    }
  }
}

/**
 * Get bahan grouped by nota
 * Returns notas with their items and totals
 */
export async function getBahanGroupedByNota(proyekId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized', data: [] }
    }

    const bahanByNota = await db
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
            'gambar', ${bahanHarians.gambar}
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
    
    return { success: true, data: bahanByNota }
  } catch (error) {
    console.error('Error grouping bahan by nota:', error)
    return { success: false, error: 'Gagal mengelompokkan bahan', data: [] }
  }
}

/**
 * Get bahan by nota ID
 * Useful for getting all items in a specific nota
 */
export async function getBahanByNota(notaId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized', data: [] }
    }

    const bahan = await db
      .select({
        id: bahanHarians.id,
        nama: bahanHarians.nama,
        deskripsi: bahanHarians.deskripsi,
        harga: bahanHarians.harga,
        kuantitas: bahanHarians.kuantitas,
        satuan: bahanHarians.satuan,
        kategori: bahanHarians.kategori,
        status: bahanHarians.status,
        gambar: bahanHarians.gambar,
        createdAt: bahanHarians.createdAt,
        milestone: sql<{
          id: string
          nama: string
        } | null>`CASE 
          WHEN ${milestones.id} IS NOT NULL THEN
            jsonb_build_object(
              'id', ${milestones.id},
              'nama', ${milestones.nama}
            )
          ELSE NULL
        END`
      })
      .from(bahanHarians)
      .leftJoin(milestones, eq(bahanHarians.milestoneId, milestones.id))
      .where(eq(bahanHarians.notaId, notaId))
      .orderBy(bahanHarians.createdAt)

    return { success: true, data: bahan }
  } catch (error) {
    console.error('Error fetching bahan by nota:', error)
    return { success: false, error: 'Gagal memuat bahan dari nota', data: [] }
  }
}

/**
 * Delete bahan (with authorization check)
 */
export async function deleteBahan(bahanId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const mandorId = session.user.id

    // Get bahan with nota and project info
    const bahan = await db.query.bahanHarians.findFirst({
      where: eq(bahanHarians.id, bahanId),
      with: {
        nota: true,
        projek: true
      }
    })

    if (!bahan) {
      return { success: false, error: 'Bahan tidak ditemukan' }
    }

    if (bahan.projek.mandorId !== mandorId) {
      return { success: false, error: 'Unauthorized' }
    }

    await db
      .delete(bahanHarians)
      .where(eq(bahanHarians.id, bahanId))

    revalidatePath(`/mandor/proyek/${bahan.proyekId}`)
    
    return { 
      success: true, 
      message: 'Bahan berhasil dihapus' 
    }
  } catch (error: any) {
    console.error('Error deleting bahan:', error)
    return { 
      success: false, 
      error: error.message || 'Gagal menghapus bahan' 
    }
  }
}