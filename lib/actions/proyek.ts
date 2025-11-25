// FILE: lib/actions/proyek.ts
// ========================================
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { projeks, type NewProjek, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Type untuk data dari form
interface ProyekFormData {
  nama: string
  tipeLayanan: string
  pelangganId: string
  mandorId?: string
  deskripsi: string
  alamat: string
  telpon?: string
  mulai: string
  status: string
}

export async function createProyek(formData: ProyekFormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const projekData = {
      nama: formData.nama,
      tipeLayanan: formData.tipeLayanan,
      pelangganId: formData.pelangganId,
      mandorId: formData.mandorId || null,
      deskripsi: formData.deskripsi,
      alamat: formData.alamat,
      telpon: formData.telpon || null,
      mulai: new Date(formData.mulai),
      status: formData.status,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [proyek] = await db.insert(projeks).values(projekData).returning()
    revalidatePath('/admin/proyek')
    return { success: true, data: proyek }
  } catch (error) {
    console.error('Error creating proyek:', error)
    return { success: false, error: 'Gagal membuat proyek' }
  }
}

export async function updateProyek(id: string, formData: Partial<ProyekFormData>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    // Handle each field
    if (formData.nama !== undefined) updateData.nama = formData.nama
    if (formData.tipeLayanan !== undefined) updateData.tipeLayanan = formData.tipeLayanan
    if (formData.pelangganId !== undefined) updateData.pelangganId = formData.pelangganId
    if (formData.mandorId !== undefined) updateData.mandorId = formData.mandorId || null
    if (formData.deskripsi !== undefined) updateData.deskripsi = formData.deskripsi
    if (formData.alamat !== undefined) updateData.alamat = formData.alamat
    if (formData.telpon !== undefined) updateData.telpon = formData.telpon || null
    if (formData.mulai !== undefined) updateData.mulai = new Date(formData.mulai)
    if (formData.status !== undefined) updateData.status = formData.status

    const [proyek] = await db
      .update(projeks)
      .set(updateData)
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

// Fungsi untuk mendapatkan semua proyek dengan data user
export async function getAllProyeks() {
  try {
    console.log('🔄 Fetching all proyeks with user data...')
    
    // Gunakan query terpisah untuk menghindari alias conflict
    const proyeksData = await db
      .select({
        id: projeks.id,
        nama: projeks.nama,
        tipeLayanan: projeks.tipeLayanan,
        pelangganId: projeks.pelangganId,
        mandorId: projeks.mandorId,
        status: projeks.status,
        progress: projeks.progress,
        alamat: projeks.alamat,
        deskripsi: projeks.deskripsi,
        telpon: projeks.telpon,
        mulai: projeks.mulai,
      })
      .from(projeks)

    console.log('📊 Raw proyeks data:', proyeksData)

    // Ambil data user secara terpisah
    const pelangganIds = proyeksData.map(p => p.pelangganId).filter(Boolean)
    const mandorIds = proyeksData.map(p => p.mandorId).filter(Boolean)
    const allUserIds = [...new Set([...pelangganIds, ...mandorIds])]

    let usersData: any[] = []
    if (allUserIds.length > 0) {
      usersData = await db
        .select({
          id: users.id,
          nama: users.nama,
          username: users.username,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, allUserIds[0])) // Drizzle doesn't support IN with uuid array easily
        // Untuk sementara, ambil semua user dan filter di JavaScript
    }

    // Fallback: ambil semua user
    if (usersData.length === 0) {
      usersData = await db
        .select({
          id: users.id,
          nama: users.nama,
          username: users.username,
          email: users.email,
        })
        .from(users)
    }

    console.log('👥 All users data:', usersData)

    // Format data dengan menggabungkan proyek dan user
    const formattedData = proyeksData.map(proyek => {
      // Cari data pelanggan
      const pelanggan = usersData.find(user => user.id === proyek.pelangganId)
      const pelangganName = pelanggan?.nama || pelanggan?.username || pelanggan?.email || 'Pelanggan Tidak Diketahui'
      
      // Cari data mandor
      const mandor = proyek.mandorId ? usersData.find(user => user.id === proyek.mandorId) : null
      const mandorName = mandor ? (mandor.nama || mandor.username || mandor.email || 'Mandor Tidak Diketahui') : undefined

      return {
        id: proyek.id,
        nama: proyek.nama,
        tipeLayanan: proyek.tipeLayanan,
        pelangganId: proyek.pelangganId,
        pelanggan: pelangganName,
        mandorId: proyek.mandorId,
        mandor: mandorName,
        status: proyek.status,
        progress: proyek.progress || 0,
        alamat: proyek.alamat,
        deskripsi: proyek.deskripsi,
        telpon: proyek.telpon,
        mulai: proyek.mulai instanceof Date 
          ? proyek.mulai.toISOString().split('T')[0] 
          : new Date(proyek.mulai).toISOString().split('T')[0],
      }
    })

    console.log('🎯 Formatted proyek data:', formattedData)
    return formattedData
  } catch (error) {
    console.error('❌ Error fetching proyeks:', error)
    return []
  }
}

// Fungsi untuk mendapatkan data pelanggan
export async function getPelangganOptions() {
  try {
    console.log('🔄 Fetching pelanggan options...')
    
    const pelangganData = await db
      .select({
        id: users.id,
        nama: users.nama,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, 'pelanggan'))

    console.log('📊 Raw pelanggan data:', pelangganData)

    const options = pelangganData.map(user => ({
      value: user.id,
      label: user.nama || user.username || user.email,
    }))

    console.log('🎯 Pelanggan options:', options)
    return options
  } catch (error) {
    console.error('❌ Error fetching pelanggan:', error)
    return []
  }
}

// Fungsi untuk mendapatkan data mandor
export async function getMandorOptions() {
  try {
    console.log('🔄 Fetching mandor options...')
    
    const mandorData = await db
      .select({
        id: users.id,
        nama: users.nama,
        username: users.username,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, 'mandor'))

    console.log('📊 Raw mandor data:', mandorData)

    const options = [
      { value: '', label: 'Belum ditentukan' },
      ...mandorData.map(user => ({
        value: user.id,
        label: user.nama || user.username || user.email,
      }))
    ]

    console.log('🎯 Mandor options:', options)
    return options
  } catch (error) {
    console.error('❌ Error fetching mandor:', error)
    return [{ value: '', label: 'Belum ditentukan' }]
  }
}