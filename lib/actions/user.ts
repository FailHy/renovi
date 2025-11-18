'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { users, type NewUser } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// --- FUNGSI GET USERS ---
// Mengambil semua data pengguna dengan urutan nama ascending
export async function getUsers() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const allUsers = await db.select().from(users).orderBy(asc(users.nama))
    return { success: true, data: allUsers }
  } catch (error) {
    console.error('Error fetching users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Gagal memuat pengguna'
    return { success: false, error: errorMessage }
  }
}

// --- FUNGSI CREATE USER ---
// Membuat pengguna baru dengan password yang di-hash
export async function createUser(data: NewUser & { password?: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    if (!data.password) {
      throw new Error('Password harus diisi saat membuat pengguna baru')
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
    const errorMessage = error instanceof Error ? error.message : 'Gagal membuat pengguna'
    return { success: false, error: errorMessage }
  }
}

// --- FUNGSI UPDATE USER ---
// Mengupdate data pengguna, termasuk password jika diubah
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
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengupdate pengguna'
    return { success: false, error: errorMessage }
  }
}

// --- FUNGSI DELETE USER ---
// Menghapus pengguna dengan proteksi admin terakhir
export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Tambahan: Jangan biarkan admin terakhir dihapus
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'))
    if (adminUsers.length <= 1 && adminUsers[0].id === id) {
      throw new Error('Tidak dapat menghapus admin terakhir.')
    }

    await db.delete(users).where(eq(users.id, id))
    revalidatePath('/admin/pengguna')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus pengguna'
    return { success: false, error: errorMessage }
  }
}