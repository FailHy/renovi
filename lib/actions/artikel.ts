// FILE: lib/actions/artikel.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { artikels, type NewArtikel } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createArtikel(data: Omit<NewArtikel, 'authorId'>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [artikel] = await db
      .insert(artikels)
      .values({
        ...data,
        authorId: session.user.id,
      })
      .returning()

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true, data: artikel }
  } catch (error) {
    console.error('Error creating artikel:', error)
    return { success: false, error: 'Gagal membuat artikel' }
  }
}

export async function updateArtikel(id: string, data: Partial<NewArtikel>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [artikel] = await db
      .update(artikels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(artikels.id, id))
      .returning()

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true, data: artikel }
  } catch (error) {
    console.error('Error updating artikel:', error)
    return { success: false, error: 'Gagal mengupdate artikel' }
  }
}

export async function deleteArtikel(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    await db.delete(artikels).where(eq(artikels.id, id))
    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true }
  } catch (error) {
    console.error('Error deleting artikel:', error)
    return { success: false, error: 'Gagal menghapus artikel' }
  }
}