// FILE: lib/actions/mandor/nota.ts - FIXED VERSION
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  notaBelanjas, 
  bahanHarians, 
  projeks, 
  milestones,
  users 
} from '@/lib/db/schema'
import { eq, and, desc, sql, asc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

/**
 * Generate unique invoice number
 */
function generateNomorNota(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `NOTA/${year}${month}${day}/${random}`
}

/**
 * Create Nota with multiple bahan items
 */
export async function createNotaWithBahan(data: {
  proyekId: string
  milestoneId?: string
  namaToko: string
  fotoNotaUrl: string
  tanggalBelanja: string
  bahan_items: Array<{
    nama: string
    deskripsi?: string
    harga: number
    kuantitas: number
    satuan: string
    kategori?: string
    gambar?: string[]
    milestoneId?: string
  }>
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

    // Verify project belongs to mandor
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

    // Verify milestone belongs to project if provided
    if (data.milestoneId) {
      const milestone = await db.query.milestones.findFirst({
        where: and(
          eq(milestones.id, data.milestoneId),
          eq(milestones.proyekId, data.proyekId)
        )
      })

      if (!milestone) {
        return {
          success: false,
          error: 'Milestone not found or does not belong to this project'
        }
      }
    }

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create nota belanja
      const notaId = uuidv4()
      const nomorNota = generateNomorNota()
      
      const [newNota] = await tx.insert(notaBelanjas)
        .values({
          id: notaId,
          proyekId: data.proyekId,
          milestoneId: data.milestoneId || null,
          createdBy: mandorId,
          nomorNota,
          namaToko: data.namaToko,
          fotoNotaUrl: data.fotoNotaUrl,
          tanggalBelanja: new Date(data.tanggalBelanja),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      // 2. Create all bahan items linked to this nota
      const bahanPromises = data.bahan_items.map((item) =>
        tx.insert(bahanHarians)
          .values({
            id: uuidv4(),
            proyekId: data.proyekId,
            notaId: notaId,
            milestoneId: item.milestoneId || data.milestoneId || null,
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            harga: item.harga.toString(),
            kuantitas: item.kuantitas.toString(),
            satuan: item.satuan as any,
            kategori: item.kategori || null,
            gambar: item.gambar || [],
            status: 'Digunakan',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
      )

      const allBahan = await Promise.all(bahanPromises)

      // 3. Update project lastUpdate
      await tx.update(projeks)
        .set({ 
          lastUpdate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(projeks.id, data.proyekId))

      return {
        nota: newNota,
        bahan_items: allBahan.map(b => b[0])
      }
    })

    revalidatePath(`/mandor/proyek/${data.proyekId}/bahan`)
    revalidatePath(`/mandor/proyek/${data.proyekId}`)

    return {
      success: true,
      data: result,
      message: 'Nota berhasil dibuat dengan ' + data.bahan_items.length + ' item bahan'
    }
  } catch (error) {
    console.error('Error creating nota with bahan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create nota'
    }
  }
}

/**
 * Get all Nota for a project
 */
export async function getNotaByProjectId(projectId: string) {
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

    // Verify project belongs to mandor
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

    const allNota = await db.query.notaBelanjas.findMany({
      where: eq(notaBelanjas.proyekId, projectId),
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
          }
        }
      }
    })

    return {
      success: true,
      data: allNota
    }
  } catch (error) {
    console.error('Error fetching nota:', error)
    return {
      success: false,
      error: 'Failed to fetch nota',
      data: []
    }
  }
}

/**
 * Get Nota by ID with all details - CONSOLIDATED FUNCTION
 * Used by both API routes and page components
 */
export async function getNotaById(notaId: string) {
  try {
    // Validate notaId parameter
    if (!notaId || notaId.trim() === '') {
      return {
        success: false,
        error: 'Nota ID is required',
        data: null
      }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: null
      }
    }

    const mandorId = session.user.id

    const notaData = await db.query.notaBelanjas.findFirst({
      where: eq(notaBelanjas.id, notaId),
      with: {
        projek: {
          columns: {
            id: true,
            nama: true,
            mandorId: true
          }
        },
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
          orderBy: [asc(bahanHarians.createdAt)]
        }
      }
    })

    if (!notaData) {
      return {
        success: false,
        error: 'Nota not found',
        data: null
      }
    }

    // Verify mandor owns this project
    if (notaData.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized - You do not have access to this nota',
        data: null
      }
    }

    // Calculate total price
    const totalHarga = notaData.items.reduce(
      (sum, item) => sum + (Number(item.harga) * Number(item.kuantitas)), 
      0
    )

    // Format response with additional calculated fields
    const formattedData = {
      ...notaData,
      total_harga: totalHarga,
      jumlah_item: notaData.items.length,
    }

    return {
      success: true,
      data: formattedData
    }
  } catch (error) {
    console.error('Error fetching nota details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nota details',
      data: null
    }
  }
}

/**
 * Alias for page components - same as getNotaById
 * @deprecated Use getNotaById instead
 */
export async function getNotaDetailForPage(notaId: string) {
  return getNotaById(notaId)
}

/**
 * Update Nota basic information
 */
export async function updateNota(
  notaId: string,
  data: {
    namaToko?: string
    tanggalBelanja?: string
    fotoNotaUrl?: string
  }
) {
  try {
    // Validate notaId
    if (!notaId || notaId.trim() === '') {
      return {
        success: false,
        error: 'Nota ID is required'
      }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Verify nota belongs to mandor
    const existingNota = await db.query.notaBelanjas.findFirst({
      where: eq(notaBelanjas.id, notaId),
      with: {
        projek: {
          columns: {
            id: true,
            mandorId: true
          }
        }
      }
    })

    if (!existingNota) {
      return {
        success: false,
        error: 'Nota not found'
      }
    }

    // Check authorization
    if (existingNota.createdBy !== mandorId && existingNota.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.namaToko !== undefined) updateData.namaToko = data.namaToko
    if (data.tanggalBelanja !== undefined) updateData.tanggalBelanja = new Date(data.tanggalBelanja)
    if (data.fotoNotaUrl !== undefined) updateData.fotoNotaUrl = data.fotoNotaUrl

    const [updatedNota] = await db.update(notaBelanjas)
      .set(updateData)
      .where(eq(notaBelanjas.id, notaId))
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, existingNota.proyekId))

    revalidatePath(`/mandor/proyek/${existingNota.proyekId}/bahan`)
    revalidatePath(`/mandor/proyek/${existingNota.proyekId}`)

    return {
      success: true,
      data: updatedNota,
      message: 'Nota berhasil diupdate'
    }
  } catch (error) {
    console.error('Error updating nota:', error)
    return {
      success: false,
      error: 'Failed to update nota'
    }
  }
}

/**
 * Delete Nota
 */
export async function deleteNota(notaId: string) {
  try {
    // Validate notaId
    if (!notaId || notaId.trim() === '') {
      return {
        success: false,
        error: 'Nota ID is required'
      }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Verify nota belongs to mandor
    const existingNota = await db.query.notaBelanjas.findFirst({
      where: eq(notaBelanjas.id, notaId),
      with: {
        projek: {
          columns: {
            id: true,
            mandorId: true
          }
        }
      }
    })

    if (!existingNota) {
      return {
        success: false,
        error: 'Nota not found'
      }
    }

    // Check authorization
    if (existingNota.createdBy !== mandorId && existingNota.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    await db.delete(notaBelanjas)
      .where(eq(notaBelanjas.id, notaId))

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, existingNota.proyekId))

    revalidatePath(`/mandor/proyek/${existingNota.proyekId}/bahan`)
    revalidatePath(`/mandor/proyek/${existingNota.proyekId}`)

    return {
      success: true,
      message: 'Nota berhasil dihapus'
    }
  } catch (error) {
    console.error('Error deleting nota:', error)
    return {
      success: false,
      error: 'Failed to delete nota'
    }
  }
}

/**
 * Get Nota Statistics for project
 */
export async function getNotaStatistics(projectId: string) {
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

    // Verify project belongs to mandor
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
        data: null
      }
    }

    // Get statistics - using aggregate query
    const [totalNotaResult] = await db
      .select({
        total_nota: sql<number>`COUNT(*)::int`,
        total_spent: sql<number>`COALESCE(SUM(total_harga_calc.total), 0)::numeric`
      })
      .from(notaBelanjas)
      .leftJoin(
        sql`(
          SELECT 
            bh.nota_id,
            SUM(CAST(bh.harga AS DECIMAL) * CAST(bh.kuantitas AS DECIMAL)) as total
          FROM bahan_harian bh
          GROUP BY bh.nota_id
        ) as total_harga_calc`,
        sql`nota_belanja.id = total_harga_calc.nota_id`
      )
      .where(eq(notaBelanjas.proyekId, projectId))

    // Get recent nota
    const recentNota = await db.query.notaBelanjas.findMany({
      where: eq(notaBelanjas.proyekId, projectId),
      orderBy: [desc(notaBelanjas.tanggalBelanja)],
      limit: 5,
      columns: {
        id: true,
        nomorNota: true,
        namaToko: true,
        tanggalBelanja: true
      }
    })

    return {
      success: true,
      data: {
        total_nota: Number(totalNotaResult?.total_nota || 0), 
        total_spent: Number(totalNotaResult?.total_spent || 0), 
        recent_nota: recentNota
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
 * Get bahan items by nota
 */
export async function getBahanByNotaId(notaId: string) {
  try {
    // Validate notaId
    if (!notaId || notaId.trim() === '') {
      return {
        success: false,
        error: 'Nota ID is required',
        data: []
      }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized',
        data: []
      }
    }

    const mandorId = session.user.id

    // Verify nota belongs to mandor's project
    const nota = await db.query.notaBelanjas.findFirst({
      where: eq(notaBelanjas.id, notaId),
      with: {
        projek: {
          columns: {
            id: true,
            mandorId: true
          }
        }
      }
    })

    if (!nota) {
      return {
        success: false,
        error: 'Nota not found',
        data: []
      }
    }

    // Check authorization
    if (nota.projek.mandorId !== mandorId && nota.createdBy !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized',
        data: []
      }
    }

    const bahanItems = await db.query.bahanHarians.findMany({
      where: eq(bahanHarians.notaId, notaId),
      orderBy: [asc(bahanHarians.createdAt)],
      with: {
        milestone: {
          columns: {
            id: true,
            nama: true
          }
        }
      }
    })

    return {
      success: true,
      data: bahanItems
    }
  } catch (error) {
    console.error('Error fetching bahan by nota:', error)
    return {
      success: false,
      error: 'Failed to fetch bahan items',
      data: []
    }
  }
}

/**
 * Add new bahan item to existing nota
 */
export async function addBahanToNota(notaId: string, data: {
  nama: string
  deskripsi?: string
  harga: number
  kuantitas: number
  satuan: string
  kategori?: string
  gambar?: string[]
  milestoneId?: string
}) {
  try {
    // Validate notaId
    if (!notaId || notaId.trim() === '') {
      return {
        success: false,
        error: 'Nota ID is required'
      }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Verify nota belongs to mandor
    const nota = await db.query.notaBelanjas.findFirst({
      where: eq(notaBelanjas.id, notaId),
      with: {
        projek: {
          columns: {
            id: true,
            mandorId: true
          }
        }
      }
    })

    if (!nota) {
      return {
        success: false,
        error: 'Nota not found'
      }
    }

    // Check authorization
    if (nota.createdBy !== mandorId && nota.projek.mandorId !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const [newBahan] = await db.insert(bahanHarians)
      .values({
        id: uuidv4(),
        proyekId: nota.proyekId,
        notaId,
        milestoneId: data.milestoneId || null,
        nama: data.nama,
        deskripsi: data.deskripsi || '',
        harga: data.harga.toString(),
        kuantitas: data.kuantitas.toString(),
        satuan: data.satuan as any,
        kategori: data.kategori || null,
        gambar: data.gambar || [],
        status: 'Digunakan',
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
      .where(eq(projeks.id, nota.proyekId))

    revalidatePath(`/mandor/proyek/${nota.proyekId}/bahan`)
    revalidatePath(`/mandor/nota/${notaId}`)

    return {
      success: true,
      data: newBahan,
      message: 'Bahan berhasil ditambahkan ke nota'
    }
  } catch (error) {
    console.error('Error adding bahan to nota:', error)
    return {
      success: false,
      error: 'Failed to add bahan to nota'
    }
  }
}

/**
 * Update Bahan Item
 */
export async function updateBahanItem(bahanId: string, data: {
  nama?: string
  deskripsi?: string
  harga?: number
  kuantitas?: number
  satuan?: string
  kategori?: string
  status?: 'Digunakan' | 'Sisa' | 'Rusak'
}) {
  try {
    // Validate bahanId
    if (!bahanId || bahanId.trim() === '') {
      return {
        success: false,
        error: 'Bahan ID is required'
      }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: 'Unauthorized'
      }
    }

    const mandorId = session.user.id

    // Verify bahan belongs to mandor's project
    const bahan = await db.query.bahanHarians.findFirst({
      where: eq(bahanHarians.id, bahanId),
      with: {
        nota: {
          columns: {
            id: true,
            createdBy: true,
            proyekId: true
          },
          with: {
            projek: {
              columns: {
                id: true,
                mandorId: true
              }
            }
          }
        }
      }
    })

    if (!bahan) {
      return {
        success: false,
        error: 'Bahan not found'
      }
    }

    // Check authorization
    if (bahan.nota.projek.mandorId !== mandorId && bahan.nota.createdBy !== mandorId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (data.nama !== undefined) updateData.nama = data.nama
    if (data.deskripsi !== undefined) updateData.deskripsi = data.deskripsi
    if (data.harga !== undefined) updateData.harga = data.harga.toString()
    if (data.kuantitas !== undefined) updateData.kuantitas = data.kuantitas.toString()
    if (data.satuan !== undefined) updateData.satuan = data.satuan
    if (data.kategori !== undefined) updateData.kategori = data.kategori
    if (data.status !== undefined) updateData.status = data.status

    const [updatedBahan] = await db.update(bahanHarians)
      .set(updateData)
      .where(eq(bahanHarians.id, bahanId))
      .returning()

    // Update project lastUpdate
    await db.update(projeks)
      .set({ 
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(projeks.id, bahan.nota.proyekId))

    revalidatePath(`/mandor/proyek/${bahan.nota.proyekId}/bahan`)
    revalidatePath(`/mandor/nota/${bahan.notaId}`)

    return {
      success: true,
      data: updatedBahan,
      message: 'Bahan berhasil diupdate'
    }
  } catch (error) {
    console.error('Error updating bahan item:', error)
    return {
      success: false,
      error: 'Failed to update bahan item'
    }
  }
}