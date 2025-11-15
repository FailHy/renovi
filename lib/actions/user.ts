// FILE: lib/actions/user.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { users, type NewUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createUser(data: NewUser & { password: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning()

    revalidatePath('/admin/pengguna')
    return { success: true, data: user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Gagal membuat pengguna' }
  }
}

export async function updateUser(
  id: string,
  data: Partial<NewUser> & { password?: string }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const updateData: any = { ...data, updatedAt: new Date() }

    // Hash password jika diubah
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    } else {
      delete updateData.password
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    revalidatePath('/admin/pengguna')
    return { success: true, data: user }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Gagal mengupdate pengguna' }
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    await db.delete(users).where(eq(users.id, id))
    revalidatePath('/admin/pengguna')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Gagal menghapus pengguna' }
  }
}