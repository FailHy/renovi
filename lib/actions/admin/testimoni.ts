// FILE: lib/actions/admin/testimoni.ts - PERBAIKAN LENGKAP DAN LENGKAP
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { 
  testimonis, 
  users, 
  projeks, 
  type NewTestimoni 
} from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ✅ Type untuk testimoni dengan relasi
export interface TestimoniWithRelations {
  id: string
  comment: string
  rating: number
  image: string | null
  approved: boolean
  approvedAt: Date | null
  createdAt: Date
  updatedAt: Date
  userId: string
  projectId: string
  approvedBy: string | null
  user: {
    id: string
    name: string
    email: string
  } | null
  project: {
    id: string
    name: string
    type: string
  } | null
  approver: {
    id: string
    name: string
    email: string
  } | null
}

export async function getTestimonis() {
  try {
    console.log('🔄 Admin fetching testimonials...')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('❌ No session found')
      return { success: false, error: 'Unauthorized' }
    }

    // ✅ FIX: Gunakan query terpisah untuk menghindari JOIN conflict
    // 1. Ambil semua testimoni
    const testimoniList = await db.query.testimonis.findMany({
      orderBy: (testimonis, { desc }) => [desc(testimonis.createdAt)],
      with: {
        // Include user (pelanggan yang bikin testimoni)
        user: {
          columns: {
            id: true,
            nama: true,
            email: true
          }
        },
        // Include project
        projek: {
          columns: {
            id: true,
            nama: true,
            tipeLayanan: true
          }
        },
        // Include approver (admin yang approve)
        approver: {
          columns: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    })

    console.log(`✅ Found ${testimoniList.length} testimonials in database`)

    // ✅ Transform data ke format yang diharapkan UI
    const formattedTestimonials: TestimoniWithRelations[] = testimoniList.map(item => ({
      id: item.id,
      comment: item.komentar,
      rating: item.rating,
      image: item.gambar,
      approved: item.approved,
      approvedAt: item.approvedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      userId: item.userId,
      projectId: item.proyekId,
      approvedBy: item.approvedBy,
      user: item.user ? {
        id: item.user.id,
        name: item.user.nama,
        email: item.user.email
      } : null,
      project: item.projek ? {
        id: item.projek.id,
        name: item.projek.nama,
        type: item.projek.tipeLayanan
      } : null,
      approver: item.approver ? {
        id: item.approver.id,
        name: item.approver.nama,
        email: item.approver.email
      } : null
    }))

    console.log('Formatted testimonials:', formattedTestimonials.length)

    return { 
      success: true, 
      data: formattedTestimonials
    }
  } catch (error) {
    console.error('❌ Error fetching testimonials:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Gagal mengambil data testimoni' 
    }
  }
}

export async function getPendingTestimonis() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // ✅ FIX: Gunakan Drizzle query dengan relations
    const pendingTestimonials = await db.query.testimonis.findMany({
      where: (testimonis, { eq }) => eq(testimonis.approved, false),
      orderBy: (testimonis, { desc }) => [desc(testimonis.createdAt)],
      with: {
        user: {
          columns: {
            nama: true,
            email: true
          }
        },
        projek: {
          columns: {
            nama: true,
            tipeLayanan: true
          }
        }
      }
    })

    // Transform data
    const formattedData = pendingTestimonials.map(item => ({
      id: item.id,
      comment: item.komentar,
      rating: item.rating,
      image: item.gambar,
      createdAt: item.createdAt,
      user: {
        name: item.user?.nama || 'N/A',
        email: item.user?.email || 'N/A'
      },
      project: {
        name: item.projek?.nama || 'Proyek Tanpa Nama',
        type: item.projek?.tipeLayanan || 'Layanan'
      }
    }))

    return { success: true, data: formattedData }
  } catch (error) {
    console.error('Error fetching pending testimonials:', error)
    return { success: false, error: 'Gagal mengambil testimoni pending' }
  }
}

export async function getTestimoniById(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    console.log(`🔍 Fetching testimoni by ID: ${id}`)

    // ✅ FIX: Gunakan Drizzle query dengan relations
    const testimonial = await db.query.testimonis.findFirst({
      where: (testimonis, { eq }) => eq(testimonis.id, id),
      with: {
        user: {
          columns: {
            nama: true,
            email: true
          }
        },
        projek: {
          columns: {
            nama: true,
            tipeLayanan: true
          }
        },
        approver: {
          columns: {
            nama: true,
            email: true
          }
        }
      }
    })

    if (!testimonial) {
      console.log(`❌ Testimoni ${id} not found`)
      return { success: false, error: 'Testimoni tidak ditemukan' }
    }

    // Check authorization
    if (session.user.role !== 'admin' && testimonial.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const formattedData = {
      id: testimonial.id,
      comment: testimonial.komentar,
      rating: testimonial.rating,
      image: testimonial.gambar,
      approved: testimonial.approved,
      approvedAt: testimonial.approvedAt,
      createdAt: testimonial.createdAt,
      userId: testimonial.userId,
      projectId: testimonial.proyekId,
      approvedBy: testimonial.approvedBy,
      user: {
        name: testimonial.user?.nama || 'N/A',
        email: testimonial.user?.email || 'N/A'
      },
      project: {
        name: testimonial.projek?.nama || 'Proyek Tanpa Nama',
        type: testimonial.projek?.tipeLayanan || 'Layanan'
      },
      approver: testimonial.approver ? {
        name: testimonial.approver.nama,
        email: testimonial.approver.email
      } : null
    }

    return { success: true, data: formattedData }
  } catch (error) {
    console.error('Error fetching testimonial by id:', error)
    return { success: false, error: 'Gagal mengambil detail testimoni' }
  }
}

export async function createTestimoni(data: Omit<NewTestimoni, 'userId' | 'approved' | 'approvedAt' | 'approvedBy'>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const [testimoni] = await db
      .insert(testimonis)
      .values({
        ...data,
        userId: session.user.id,
        approved: false,
        approvedAt: null,
        approvedBy: null
      })
      .returning()

    revalidatePath('/klien/proyek')
    return { success: true, data: testimoni }
  } catch (error) {
    console.error('Error creating testimoni:', error)
    return { success: false, error: 'Gagal membuat testimoni' }
  }
}

export async function approveTestimoni(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      console.log('❌ Unauthorized approve attempt')
      return { success: false, error: 'Unauthorized' }
    }

    console.log(`✅ Admin ${session.user.id} approving testimoni ${id}`)

    // Cek apakah testimoni sudah ada
    const existingTestimoni = await db.query.testimonis.findFirst({
      where: (testimonis, { eq }) => eq(testimonis.id, id)
    })

    if (!existingTestimoni) {
      console.log(`❌ Testimoni ${id} not found for approval`)
      return { success: false, error: 'Testimoni tidak ditemukan' }
    }

    if (existingTestimoni.approved) {
      console.log(`⚠️ Testimoni ${id} already approved`)
      return { success: false, error: 'Testimoni sudah disetujui sebelumnya' }
    }

    // Update testimoni
    const [testimoni] = await db
      .update(testimonis)
      .set({
        approved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
        updatedAt: new Date()
      })
      .where(eq(testimonis.id, id))
      .returning()

    console.log(`✅ Testimoni ${id} approved successfully`)

    // Revalidate paths
    revalidatePath('/admin/testimoni')
    revalidatePath('/') // Homepage mungkin menampilkan testimoni
    revalidatePath(`/klien/proyek/${existingTestimoni.proyekId}`)

    return { success: true, data: testimoni }
  } catch (error) {
    console.error('❌ Error approving testimoni:', error)
    return { success: false, error: 'Gagal menyetujui testimoni' }
  }
}

export async function rejectTestimoni(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Cek apakah testimoni sudah ada
    const existingTestimoni = await db.query.testimonis.findFirst({
      where: (testimonis, { eq }) => eq(testimonis.id, id)
    })

    if (!existingTestimoni) {
      return { success: false, error: 'Testimoni tidak ditemukan' }
    }

    await db.delete(testimonis).where(eq(testimonis.id, id))
    
    revalidatePath('/admin/testimoni')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting testimoni:', error)
    return { success: false, error: 'Gagal menolak testimoni' }
  }
}
