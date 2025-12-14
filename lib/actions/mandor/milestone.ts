'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { milestones, projeks } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 🔄 CORE LOGIC: Sinkronisasi Otomatis Progress Proyek
 * Fungsi ini adalah kunci perbaikan. Ia akan:
 * 1. Menghitung ulang persentase milestone yang selesai.
 * 2. Menentukan status proyek secara otomatis (Perencanaan -> Dalam Progress -> Selesai).
 * 3. Menyimpan angka terbaru ke database agar dashboard tidak macet di 0%.
 */
async function syncProjectProgress(proyekId: string) {
  try {
    // 1. Ambil semua milestone aktif proyek ini
    const allMilestones = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, proyekId),
    })

    // 2. Hitung statistik
    const total = allMilestones.length
    // Abaikan milestone yang dibatalkan agar tidak merusak persentase
    const activeMilestones = allMilestones.filter(m => m.status !== 'Dibatalkan')
    const effectiveTotal = activeMilestones.length
    const completedCount = activeMilestones.filter(m => m.status === 'Selesai').length

    // 3. Hitung Persentase (0-100)
    let newProgress = 0
    if (effectiveTotal > 0) {
      newProgress = Math.round((completedCount / effectiveTotal) * 100)
    }

    // 4. Tentukan Status Proyek Otomatis berdasarkan progress real-time
    let newStatus: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | undefined

    if (newProgress === 100 && effectiveTotal > 0) {
      newStatus = 'Selesai'
    } else if (newProgress > 0 && newProgress < 100) {
      newStatus = 'Dalam Progress'
    } else if (newProgress === 0 && effectiveTotal > 0) {
      // Jika ada milestone tapi 0% selesai, set ke Dalam Progress agar tidak stuck di Perencanaan
      newStatus = 'Dalam Progress'
    } else if (total === 0) {
      // Jika milestone dihapus habis, kembalikan ke Perencanaan
      newStatus = 'Perencanaan'
    }

    // 5. Siapkan Data Update
    const updateData: any = {
      progress: newProgress,
      lastUpdate: new Date(),
      updatedAt: new Date(),
    }

    // Update status jika ada perubahan logika status
    if (newStatus) {
      updateData.status = newStatus
      
      // Khusus jika Selesai, catat tanggal selesai otomatis
      if (newStatus === 'Selesai') {
        updateData.selesai = new Date()
      }
    }

    // 6. EKSEKUSI UPDATE KE DATABASE PROYEK
    await db
      .update(projeks)
      .set(updateData)
      .where(eq(projeks.id, proyekId))

    // 7. REVALIDATE CACHE (CRITICAL)
    // Ini memaksa Next.js me-refresh data di halaman-halaman berikut agar UI langsung berubah
    revalidatePath('/mandor') 
    revalidatePath('/mandor/proyek') 
    revalidatePath(`/mandor/proyek/${proyekId}`)
    revalidatePath('/admin/proyek')
    revalidatePath('/klien/proyek')
    
    console.log(`   Synced Project ${proyekId}: Progress ${newProgress}% (${newStatus})`)

  } catch (error) {
    console.error('❌ Failed to sync project progress:', error)
  }
}

// ============================================================================
// CRUD OPERATIONS (READ, CREATE, UPDATE, DELETE)
// Semua operasi tulis (Write) sekarang otomatis memanggil syncProjectProgress
// ============================================================================

/**
 * READ: Get Milestones
 */
export async function getMilestonesByProjectId(projectId: string) {
  try {
    const session = await getServerSession(authOptions)
    // Validasi session, tapi allow read data
    if (!session?.user?.id) return { success: false, error: 'Unauthorized', data: [] }

    const result = await db.query.milestones.findMany({
      where: eq(milestones.proyekId, projectId),
      orderBy: (milestones, { asc }) => [asc(milestones.tanggal)]
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return { success: false, error: 'Failed to fetch milestones', data: [] }
  }
}

/**
 * CREATE: Milestone Baru
 */
export async function createMilestone(data: {
  proyekId: string
  nama: string
  deskripsi: string
  tanggal: string
  gambar?: string[]
  status?: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const tanggal = new Date(data.tanggal)
    if (isNaN(tanggal.getTime())) return { success: false, error: 'Tanggal tidak valid' }

    const [newItem] = await db.insert(milestones).values({
      proyekId: data.proyekId,
      nama: data.nama,
      deskripsi: data.deskripsi,
      tanggal: tanggal,
      gambar: data.gambar || [],
      status: data.status || 'Belum Dimulai',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    // 🔥 TRIGGER SYNC
    await syncProjectProgress(data.proyekId)

    return { success: true, data: newItem }
  } catch (error) {
    console.error('Error creating milestone:', error)
    return { success: false, error: 'Gagal membuat milestone' }
  }
}

/**
 * UPDATE: Edit Detail Milestone
 */
export async function updateMilestone(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    // Ambil data lama untuk mendapatkan project ID
    const oldData = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
      columns: { proyekId: true }
    })

    if (!oldData) return { success: false, error: 'Milestone not found' }

    const updateData = { ...data, updatedAt: new Date() }
    if (data.tanggal) updateData.tanggal = new Date(data.tanggal)

    await db.update(milestones).set(updateData).where(eq(milestones.id, id))

    // 🔥 TRIGGER SYNC
    await syncProjectProgress(oldData.proyekId)

    return { success: true }
  } catch (error) {
    console.error('Error updating milestone:', error)
    return { success: false, error: 'Gagal update milestone' }
  }
}

/**
 * UPDATE: Ganti Status Milestone (Tombol Cepat)
 */
export async function updateMilestoneStatus(
  milestoneId: string, 
  status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    // Ambil data lama untuk mendapatkan project ID dan status tanggal
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      columns: { proyekId: true, mulai: true }
    })

    if (!milestone) return { success: false, error: 'Milestone not found' }

    const updatePayload: any = { status, updatedAt: new Date() }
    
    // Auto set tanggal mulai/selesai milestone individual
    if (status === 'Dalam Progress' && !milestone.mulai) {
      updatePayload.mulai = new Date()
    } else if (status === 'Selesai') {
      updatePayload.selesai = new Date()
    } else if (status === 'Belum Dimulai') {
      // Reset tanggal jika dikembalikan ke awal (opsional)
      updatePayload.mulai = null
      updatePayload.selesai = null
    }

    await db.update(milestones)
      .set(updatePayload)
      .where(eq(milestones.id, milestoneId))

    // 🔥 TRIGGER SYNC (Ini yang memperbaiki bug progress bar!)
    await syncProjectProgress(milestone.proyekId)

    return { success: true }
  } catch (error) {
    console.error('Error updating status:', error)
    return { success: false, error: 'Gagal update status' }
  }
}

/**
 * DELETE: Hapus Milestone
 */
export async function deleteMilestone(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, id),
    })

    if (milestone) {
      await db.delete(milestones).where(eq(milestones.id, id))
      // 🔥 TRIGGER SYNC
      await syncProjectProgress(milestone.proyekId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting milestone:', error)
    return { success: false, error: 'Gagal menghapus milestone' }
  }
}