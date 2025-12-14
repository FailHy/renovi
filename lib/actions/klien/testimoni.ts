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
    console.log('=== CREATE TESTIMONI START ===')
    console.log('Input data:', JSON.stringify(data, null, 2))
    
    const session = await getServerSession(authOptions)
    console.log('Session:', { userId: session?.user?.id, role: session?.user?.role })
    
    if (!session?.user?.id || session.user.id !== data.klienId) {
      console.log('❌ Unauthorized')
      return { success: false, error: 'Unauthorized' }
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      console.log('❌ Invalid rating:', data.rating)
      return { success: false, error: 'Rating harus antara 1-5' }
    }

    // Verify project belongs to klien and is completed
    console.log('Checking project...')
    const project = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, data.proyekId),
        eq(projeks.pelangganId, data.klienId) //  pelangganId di projeks
      ),
      columns: {
        id: true,
        status: true,
        nama: true
      }
    })

    console.log('Project found:', project)

    if (!project) {
      console.log('❌ Project not found')
      return { success: false, error: 'Proyek tidak ditemukan' }
    }

    if (project.status !== 'Selesai') {
      console.log('❌ Project not completed. Status:', project.status)
      return {
        success: false,
        error: 'Testimoni hanya bisa diberikan untuk proyek yang sudah selesai'
      }
    }

    // Check if testimoni already exists
    console.log('Checking existing testimoni...')
    const existingTestimoni = await db.query.testimonis.findFirst({
      where: and(
        eq(testimonis.proyekId, data.proyekId),
        eq(testimonis.userId, data.klienId) //  FIX: userId (bukan pelangganId!)
      )
    })

    console.log('Existing testimoni:', existingTestimoni ? 'Found' : 'Not found')

    if (existingTestimoni) {
      console.log('❌ Testimoni already exists')
      return {
        success: false,
        error: 'Anda sudah memberikan testimoni untuk proyek ini'
      }
    }

    //  FIX: Create testimoni dengan field yang BENAR
    console.log('Creating testimoni...')
    const testimoniId = uuidv4()
    
    const testimoniData = {
      id: testimoniId,
      proyekId: data.proyekId,
      userId: data.klienId,        //  FIX: userId (sesuai schema!)
      rating: data.rating,
      komentar: data.komentar,
      gambar: null,                //  Add: gambar field
      approved: false,             //  Add: approved field
      approvedAt: null,            //  Add: approvedAt field
      approvedBy: null,            //  Add: approvedBy field
      posting: new Date(),         //  Add: posting field
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('Testimoni data to insert:', testimoniData)

    const [newTestimoni] = await db.insert(testimonis)
      .values(testimoniData)
      .returning()

    console.log('   Testimoni inserted successfully:', newTestimoni.id)

    // Revalidate paths
    revalidatePath(`/klien/proyek/${data.proyekId}`)
    revalidatePath('/klien/proyek')
    revalidatePath('/admin/testimoni')

    console.log('=== CREATE TESTIMONI END ===')

    return {
      success: true,
      data: newTestimoni,
      message: 'Testimoni berhasil dikirim. Terima kasih atas feedback Anda!'
    }
  } catch (error) {
    console.error('❌❌❌ ERROR in createTestimoni:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
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
        user: {
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
      where: sql`EXISTS (
        SELECT 1 FROM ${projeks} 
        WHERE ${projeks.id} = ${testimonis.proyekId} 
        AND ${projeks.mandorId} = ${mandorId}
      )`,
      with: {
        projek: {
          columns: {
            id: true,
            nama: true
          }
        },
        user: {
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