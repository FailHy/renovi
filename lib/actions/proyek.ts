// FILE: lib/actions/proyek.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { projeks, type NewProjek } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createProyek(data: NewProjek) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [proyek] = await db.insert(projeks).values(data).returning()
    revalidatePath('/admin/proyek')
    return { success: true, data: proyek }
  } catch (error) {
    console.error('Error creating proyek:', error)
    return { success: false, error: 'Gagal membuat proyek' }
  }
}

export async function updateProyek(id: string, data: Partial<NewProjek>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [proyek] = await db
      .update(projeks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projeks.id, id))
      .returning()

    revalidatePath('/admin/proyek')
    return { success: true, data: proyek }
  } catch (error) {
    console.error('Error updating proyek:', error)
    return { success: false, error: 'Gagal mengupdate proyek' }
  }
}

export async function deleteProyek(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    await db.delete(projeks).where(eq(projeks.id, id))
    revalidatePath('/admin/proyek')
    return { success: true }
  } catch (error) {
    console.error('Error deleting proyek:', error)
    return { success: false, error: 'Gagal menghapus proyek' }
  }
}
