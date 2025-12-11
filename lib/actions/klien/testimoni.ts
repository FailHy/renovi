// FILE: lib/actions/klien/testimoni.ts - FIXED
'use server'

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { testimonis, projeks } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

/**
 * Create new testimoni for a completed project
 */
export async function createTestimoni(data: {
  proyekId: string
  klienId: string
  rating: number
  komentar: string
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.id !== data.klienId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: 'Rating harus antara 1-5'
      }
    }

    // Verify project belongs to klien and is completed
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, data.proyekId),
        eq(projeks.pelangganId, data.klienId) // FIX: pelangganId
      ),
      columns: {
        id: true,
        status: true,
        nama: true
      }
    })

    if (!project) {
      return {
        success: false,
        error: 'Proyek tidak ditemukan'
      }
    }

    if (project.status !== 'Selesai') {
      return {
        success: false,
        error: 'Testimoni hanya bisa diberikan untuk proyek yang sudah selesai'
      }
    }

    // Check if testimoni already exists
    const existingTestimoni = await db.query.testimonis.findFirst({
      where: and(
        eq(testimonis.proyekId, data.proyekId),
        eq(testimonis.userId, data.klienId) // FIX: pelangganId
      )
    })

    if (existingTestimoni) {
      return {
        success: false,
        error: 'Anda sudah memberikan testimoni untuk proyek ini'
      }
    }

    // Create testimoni
    const [newTestimoni] = await db.insert(testimonis)
      .values({
        id: uuidv4(),
        proyekId: data.proyekId,
        pelangganId: data.klienId, // FIX: pelangganId
        rating: data.rating,
        komentar: data.komentar,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    revalidatePath(`/klien/proyek/${data.proyekId}`)
    revalidatePath('/klien/proyek')

    return {
      success: true,
      data: newTestimoni,
      message: 'Testimoni berhasil dikirim. Terima kasih atas feedback Anda!'
    }
  } catch (error) {
    console.error('Error creating testimoni:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengirim testimoni'
    }
  }
}

/**
 * Get testimoni by project ID
 */
export async function getTestimoniByProyek(proyekId: string) {
  try {
    const testimoni = await db.query.testimonis.findFirst({
      where: eq(testimonis.proyekId, proyekId),
      with: {
        user: { // FIX: pelanggan relation
          columns: {
            id: true,
            nama: true
          }
        },
        projek: {
          columns: {
            id: true,
            nama: true
          }
        }
      }
    })

    if (!testimoni) {
      return {
        success: false,
        error: 'Testimoni tidak ditemukan',
        data: null
      }
    }

    return {
      success: true,
      data: testimoni
    }
  } catch (error) {
    console.error('Error fetching testimoni:', error)
    return {
      success: false,
      error: 'Gagal memuat testimoni',
      data: null
    }
  }
}

/**
 * Get all testimoni for a mandor (from their projects)
 */
export async function getTestimoniForMandor(mandorId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        data: []
      }
    }

    const allTestimoni = await db.query.testimonis.findMany({
      where: sql`${projeks.mandorId} = ${mandorId}`,
      with: {
        projek: {
          columns: {
            id: true,
            nama: true
          }
        },
        user: { // FIX: pelanggan relation
          columns: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: (testimonis, { desc }) => [desc(testimonis.createdAt)]
    })

    return {
      success: true,
      data: allTestimoni
    }
  } catch (error) {
    console.error('Error fetching testimoni for mandor:', error)
    return {
      success: false,
      error: 'Gagal memuat testimoni',
      data: []
    }
  }
}

/**
 * Get average rating for a mandor
 */
export async function getAverageRatingForMandor(mandorId: string) {
  try {
    const [result] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${testimonis.rating}), 0)`,
        totalTestimoni: sql<number>`COUNT(*)::int`
      })
      .from(testimonis)
      .innerJoin(projeks, eq(testimonis.proyekId, projeks.id))
      .where(eq(projeks.mandorId, mandorId))

    return {
      averageRating: Number(result?.averageRating.toFixed(1)) || 0,
      totalTestimoni: result?.totalTestimoni || 0
    }
  } catch (error) {
    console.error('Error calculating average rating:', error)
    return {
      averageRating: 0,
      totalTestimoni: 0
    }
  }
}