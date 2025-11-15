// FILE: lib/actions/testimoni.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { testimonis, type NewTestimoni } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createTestimoni(data: Omit<NewTestimoni, 'userId'>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error('Unauthorized')
    }

    const [testimoni] = await db
      .insert(testimonis)
      .values({
        ...data,
        userId: session.user.id,
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
      throw new Error('Unauthorized')
    }

    const [testimoni] = await db
      .update(testimonis)
      .set({
        approved: true,
        approvedAt: new Date(),
        approvedBy: session.user.id,
        updatedAt: new Date(),
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
      throw new Error('Unauthorized')
    }

    await db.delete(testimonis).where(eq(testimonis.id, id))
    revalidatePath('/admin/testimoni')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting testimoni:', error)
    return { success: false, error: 'Gagal menolak testimoni' }
  }
}