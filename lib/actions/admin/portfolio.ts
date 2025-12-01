// FILE: lib/actions/portfolio.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function publishPortfolio(id: string, published: boolean) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const [portfolio] = await db
      .update(portfolios)
      .set({ published, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning()

    revalidatePath('/admin/portfolio')
    revalidatePath('/portfolio')
    return { success: true, data: portfolio }
  } catch (error) {
    console.error('Error publishing portfolio:', error)
    return { success: false, error: 'Gagal mengubah status portfolio' }
  }
}
