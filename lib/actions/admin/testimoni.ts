// FILE: lib/actions/admin/testimoni.ts
// ========================================
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
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Admin bisa melihat semua testimoni, user hanya melihat miliknya
    let whereCondition
    if (session.user.role === 'admin') {
      whereCondition = undefined
    } else {
      whereCondition = eq(testimonis.userId, session.user.id)
    }

    const testimonials = await db
      .select({
        id: testimonis.id,
        comment: testimonis.komentar,
        rating: testimonis.rating,
        image: testimonis.gambar,
        approved: testimonis.approved,
        approvedAt: testimonis.approvedAt,
        createdAt: testimonis.createdAt,
        updatedAt: testimonis.updatedAt,
        userId: testimonis.userId,
        projectId: testimonis.proyekId,
        approvedBy: testimonis.approvedBy,
        user: {
          id: users.id,
          name: users.nama,
          email: users.email
        },
        project: {
          id: projeks.id,
          name: projeks.nama,
          type: projeks.tipeLayanan
        },
        approver: {
          id: users.id, // alias for approver
          name: users.nama,
          email: users.email
        }
      })
      .from(testimonis)
      .leftJoin(users, eq(testimonis.userId, users.id))
      .leftJoin(projeks, eq(testimonis.proyekId,projeks.id))
      .leftJoin(users as any, eq(testimonis.approvedBy, users.id)) // Join untuk approver
      .where(whereCondition)
      .orderBy(desc(testimonis.createdAt))

    return { 
      success: true, 
      data: testimonials as unknown as TestimoniWithRelations[]
    }
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return { success: false, error: 'Gagal mengambil data testimoni' }
  }
}

export async function getPendingTestimonis() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const pendingTestimonials = await db
      .select({
        id: testimonis.id,
        comment: testimonis.komentar,
        rating: testimonis.rating,
        image: testimonis.gambar,
        createdAt: testimonis.createdAt,
        user: {
          name: users.nama,
          email: users.email
        },
        project: {
          name: projeks.nama,
          type: projeks.tipeLayanan
        }
      })
      .from(testimonis)
      .leftJoin(users, eq(testimonis.userId, users.id))
      .leftJoin(projeks, eq(testimonis.proyekId, projeks.id))
      .where(eq(testimonis.approved, false))
      .orderBy(desc(testimonis.createdAt))

    return { success: true, data: pendingTestimonials }
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

    // Admin bisa melihat semua, user hanya miliknya
    const conditions = session.user.role === 'admin' 
      ? eq(testimonis.id, id)
      : and(eq(testimonis.id, id), eq(testimonis.userId, session.user.id))

    const testimonial = await db
      .select({
        id: testimonis.id,
        comment: testimonis.komentar,
        rating: testimonis.rating,
        image: testimonis.gambar,
        approved: testimonis.approved,
        approvedAt: testimonis.approvedAt,
        createdAt: testimonis.createdAt,
        userId: testimonis.userId,
        projectId: testimonis.proyekId,
        approvedBy: testimonis.approvedBy,
        user: {
          name: users.nama,
          email: users.email
        },
        project: {
          name: projeks.nama,
          type: projeks.tipeLayanan
        },
        approver: {
          name: users.nama,
          email: users.email
        }
      })
      .from(testimonis)
      .leftJoin(users, eq(testimonis.userId, users.id))
      .leftJoin(projeks, eq(testimonis.proyekId, projeks.id))
      .leftJoin(users as any, eq(testimonis.approvedBy, users.id))
      .where(conditions)
      .limit(1)

    if (testimonial.length === 0) {
      return { success: false, error: 'Testimoni tidak ditemukan' }
    }

    return { success: true, data: testimonial[0] }
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
      return { success: false, error: 'Unauthorized' }
    }

    // Cek apakah testimoni sudah ada
    const existingTestimoni = await db
      .select()
      .from(testimonis)
      .where(eq(testimonis.id, id))
      .limit(1)

    if (existingTestimoni.length === 0) {
      return { success: false, error: 'Testimoni tidak ditemukan' }
    }

    if (existingTestimoni[0].approved) {
      return { success: false, error: 'Testimoni sudah disetujui sebelumnya' }
    }

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

    revalidatePath('/admin/testimoni')
    revalidatePath('/')
    return { success: true, data: testimoni }
  } catch (error) {
    console.error('Error approving testimoni:', error)
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
    const existingTestimoni = await db
      .select()
      .from(testimonis)
      .where(eq(testimonis.id, id))
      .limit(1)

    if (existingTestimoni.length === 0) {
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

export async function updateTestimoni(id: string, data: Partial<NewTestimoni>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // User hanya bisa update testimoni miliknya
    const conditions = session.user.role === 'admin' 
      ? eq(testimonis.id, id)
      : and(eq(testimonis.id, id), eq(testimonis.userId, session.user.id))

    const [testimoni] = await db
      .update(testimonis)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(conditions)
      .returning()

    if (!testimoni) {
      return { success: false, error: 'Testimoni tidak ditemukan atau tidak memiliki akses' }
    }

    revalidatePath('/admin/testimoni')
    revalidatePath('/klien/proyek')
    return { success: true, data: testimoni }
  } catch (error) {
    console.error('Error updating testimoni:', error)
    return { success: false, error: 'Gagal memperbarui testimoni' }
  }
}

export async function deleteTestimoni(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Admin bisa hapus semua, user hanya miliknya
    const conditions = session.user.role === 'admin' 
      ? eq(testimonis.id, id)
      : and(eq(testimonis.id, id), eq(testimonis.userId, session.user.id))

    const deletedTestimoni = await db
      .delete(testimonis)
      .where(conditions)
      .returning()

    if (deletedTestimoni.length === 0) {
      return { success: false, error: 'Testimoni tidak ditemukan atau tidak memiliki akses' }
    }

    revalidatePath('/admin/testimoni')
    revalidatePath('/klien/proyek')
    return { success: true }
  } catch (error) {
    console.error('Error deleting testimoni:', error)
    return { success: false, error: 'Gagal menghapus testimoni' }
  }
}