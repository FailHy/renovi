// lib/actions/user.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { users, type NewUser } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// --- FUNGSI GET USERS ---
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

// --- FUNGSI CREATE USER (FIXED) ---
export async function createUser(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Extract data dari FormData
    const nama = formData.get('nama') as string
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'admin' | 'mandor' | 'pelanggan'
    const telpon = formData.get('telpon') as string
    const alamat = formData.get('alamat') as string

    // Validasi required fields
    if (!nama || !username || !email || !password || !role) {
      throw new Error('Semua field wajib diisi')
    }

    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const [user] = await db
      .insert(users)
      .values({
        nama,
        username,
        email,
        password: hashedPassword,
        role,
        telpon: telpon || null,
        alamat: alamat || null,
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

// --- FUNGSI UPDATE USER (FIXED) ---
export async function updateUser(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Extract data dari FormData
    const nama = formData.get('nama') as string
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'admin' | 'mandor' | 'pelanggan'
    const telpon = formData.get('telpon') as string
    const alamat = formData.get('alamat') as string

    // Validasi required fields (kecuali password)
    if (!nama || !username || !email || !role) {
      throw new Error('Nama, username, email, dan role harus diisi')
    }

    const updateData: any = { 
      nama,
      username,
      email,
      role,
      telpon: telpon || null,
      alamat: alamat || null,
      updatedAt: new Date()
    }

    // Hash password hanya jika diisi
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter')
      }
      updateData.password = await bcrypt.hash(password, 10)
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
export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Jangan biarkan admin terakhir dihapus
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