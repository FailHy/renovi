// lib/actions/shared/nota.ts
'use server'

import { db } from '@/lib/db'
import { notaBelanjas, bahanHarians, milestones, users, projeks } from '@/lib/db/schema'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { UserRole } from '@/lib/utils/sharedRoles'
import { getProyekById } from './proyekShared'

export interface NotaWithItems {
  id: string
  proyekId: string
  milestoneId: string | null
  createdBy: string
  nomorNota: string | null
  namaToko: string | null
  fotoNotaUrl: string
  tanggalBelanja: Date
  createdAt: Date
  updatedAt: Date
  creator?: {
    id: string
    nama: string
  }
  milestone?: {
    id: string
    nama: string
  } | null
  items: Array<{
    id: string
    nama: string
    deskripsi: string | null
    harga: string
    kuantitas: string
    satuan: string
    kategori: string | null
    status: string
    gambar: string[] | null
    milestoneId: string | null
    createdAt: Date
    updatedAt: Date
  }>
  totalHarga: number
  totalItems: number
}

/**
 * Get all notas for a project
 */
export async function getNotaByProyekId(
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

    const notas = await db.query.notaBelanjas.findMany({
      where: eq(notaBelanjas.proyekId, proyekId),
      orderBy: [desc(notaBelanjas.tanggalBelanja), desc(notaBelanjas.createdAt)],
      with: {
        creator: {
          columns: {
            id: true,
            nama: true
          }
        },
        milestone: {
          columns: {
            id: true,
            nama: true
          }
        },
        items: {
          columns: {
            id: true,
            nama: true,
            harga: true,
            kuantitas: true,
            satuan: true,
            kategori: true,
            status: true
          },
          orderBy: [asc(bahanHarians.createdAt)]
        }
      }
    })

    // Calculate totals for each nota
    const notasWithTotals: NotaWithItems[] = notas.map(nota => {
      const totalHarga = nota.items.reduce((sum, item) => {
        return sum + (Number(item.harga) * Number(item.kuantitas))
      }, 0)

      return {
        ...nota,
        items: nota.items,
        totalHarga,
        totalItems: nota.items.length
      }
    })

    return { success: true, data: notasWithTotals }
  } catch (error) {
    console.error('Error fetching notas:', error)
    return { 
      success: false, 
      error: 'Failed to fetch notas', 
      data: [] 
    }
  }
}

/**
 * Get nota by ID with detailed information
 */
export async function getNotaByIdShared(
  notaId: string, 
  userId: string, 
  role: UserRole
) {
  try {
    // Get nota with project info
    const nota = await db.query.notaBelanjas.findFirst({
      where: eq(notaBelanjas.id, notaId),
      with: {
        projek: true,
        creator: {
          columns: {
            id: true,
            nama: true,
            role: true
          }
        },
        milestone: {
          columns: {
            id: true,
            nama: true
          }
        },
        items: {
          with: {
            milestone: {
              columns: {
                id: true,
                nama: true
              }
            }
          },
          orderBy: [asc(bahanHarians.createdAt)]
        }
      }
    })

    if (!nota) {
      return { success: false, error: 'Nota not found', data: null }
    }

    // Verify project access
    const proyekResult = await getProyekById(nota.proyekId, userId, role)
    if (!proyekResult.success) {
      return { 
        success: false, 
        error: proyekResult.error || 'Unauthorized',
        data: null 
      }
    }

    // Calculate totals
    const totalHarga = nota.items.reduce((sum, item) => {
      return sum + (Number(item.harga) * Number(item.kuantitas))
    }, 0)

    const notaWithTotals: NotaWithItems = {
      ...nota,
      items: nota.items.map(item => ({
        ...item,
        // Ensure milestone info is included
        milestone: item.milestone
      })),
      totalHarga,
      totalItems: nota.items.length
    }

    return { success: true, data: notaWithTotals }
  } catch (error) {
    console.error('Error fetching nota details:', error)
    return { 
      success: false, 
      error: 'Failed to fetch nota details', 
      data: null 
    }
  }
}

/**
 * Get nota statistics for project
 */
export async function getNotaStats(
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

    const [totalNotaResult] = await db
      .select({
        totalNota: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(total_harga.total), 0)::numeric`
      })
      .from(notaBelanjas)
      .leftJoin(
        sql`(
          SELECT 
            bh.nota_id,
            SUM(CAST(bh.harga AS DECIMAL) * CAST(bh.kuantitas AS DECIMAL)) as total
          FROM bahan_harian bh
          GROUP BY bh.nota_id
        ) as total_harga`,
        sql`${notaBelanjas.id} = total_harga.nota_id`
      )
      .where(eq(notaBelanjas.proyekId, proyekId))

    // Get recent notas
    const recentNotas = await db.query.notaBelanjas.findMany({
      where: eq(notaBelanjas.proyekId, proyekId),
      orderBy: [desc(notaBelanjas.tanggalBelanja)],
      limit: 5,
      columns: {
        id: true,
        nomorNota: true,
        namaToko: true,
        tanggalBelanja: true,
        fotoNotaUrl: true
      },
      with: {
        items: {
          columns: {
            id: true,
            nama: true
          },
          limit: 2
        }
      }
    })

    return {
      success: true,
      data: {
        totalNota: Number(totalNotaResult?.totalNota || 0),
        totalSpent: Number(totalNotaResult?.totalSpent || 0),
        recentNotas
      }
    }
  } catch (error) {
    console.error('Error fetching nota statistics:', error)
    return { 
      success: false, 
      error: 'Failed to fetch nota statistics', 
      data: null 
    }
  }
}

/**
 * Get nota grouped by month for charts
 */
export async function getNotaMonthlySummary(
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
        data: [] 
      }
    }

    const monthlySummary = await db
      .select({
        month: sql<string>`TO_CHAR(${notaBelanjas.tanggalBelanja}, 'YYYY-MM')`,
        year: sql<number>`EXTRACT(YEAR FROM ${notaBelanjas.tanggalBelanja})`,
        monthName: sql<string>`TO_CHAR(${notaBelanjas.tanggalBelanja}, 'Month')`,
        totalNota: sql<number>`COUNT(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(total_harga.total), 0)::numeric`
      })
      .from(notaBelanjas)
      .leftJoin(
        sql`(
          SELECT 
            bh.nota_id,
            SUM(CAST(bh.harga AS DECIMAL) * CAST(bh.kuantitas AS DECIMAL)) as total
          FROM bahan_harian bh
          GROUP BY bh.nota_id
        ) as total_harga`,
        sql`${notaBelanjas.id} = total_harga.nota_id`
      )
      .where(eq(notaBelanjas.proyekId, proyekId))
      .groupBy(
        sql`TO_CHAR(${notaBelanjas.tanggalBelanja}, 'YYYY-MM')`,
        sql`EXTRACT(YEAR FROM ${notaBelanjas.tanggalBelanja})`,
        sql`TO_CHAR(${notaBelanjas.tanggalBelanja}, 'Month')`
      )
      .orderBy(sql`TO_CHAR(${notaBelanjas.tanggalBelanja}, 'YYYY-MM')`)

    return {
      success: true,
      data: monthlySummary.map(row => ({
        month: row.month,
        year: row.year,
        monthName: row.monthName.trim(),
        totalNota: Number(row.totalNota),
        totalSpent: Number(row.totalSpent)
      }))
    }
  } catch (error) {
    console.error('Error fetching monthly summary:', error)
    return { 
      success: false, 
      error: 'Failed to fetch monthly summary', 
      data: [] 
    }
  }
}