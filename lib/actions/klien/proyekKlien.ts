// lib/actions/klien/proyek.ts
'use server'

import { db } from '@/lib/db'
import { projeks, users, testimonis } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 *    SINGLE SOURCE OF TRUTH
 * Mengambil data proyek untuk klien dengan progress langsung dari database.
 * TIDAK menghitung ulang progress. TIDAK derived dari milestone.
 */
export async function getProyekDetailForClient(proyekId: string, klienId: string) {
  try {
    if (!proyekId || !klienId) {
      return { success: false, error: 'Invalid parameters', data: null }
    }

    //    Gunakan Drizzle Query API yang lebih aman
    const proyek = await db.query.projeks.findFirst({
      where: and(
        eq(projeks.id, proyekId),
        eq(projeks.pelangganId, klienId) // Security: pastikan proyek milik klien ini
      ),
      with: {
        mandor: {
          columns: {
            id: true,
            nama: true,
            telpon: true,
          }
        }
      }
    })

    if (!proyek) {
      return { 
        success: false, 
        error: 'Proyek tidak ditemukan atau Anda tidak memiliki akses', 
        data: null 
      }
    }

    // Cek testimoni secara terpisah
    const testimoni = await db.query.testimonis.findFirst({
      where: and(
        eq(testimonis.proyekId, proyekId),
        eq(testimonis.userId, klienId)
      )
    })

    //    FORMAT DATA: Progress langsung dari database, tidak dihitung ulang
    const proyekData = {
      id: proyek.id,
      nama: proyek.nama,
      tipeLayanan: proyek.tipeLayanan,
      deskripsi: proyek.deskripsi,
      alamat: proyek.alamat,
      
      //    KUNCI: Progress dan Status langsung dari DB
      status: proyek.status,
      progress: proyek.progress, // ← SINGLE SOURCE OF TRUTH
      
      tanggalMulai: proyek.mulai,
      tanggalSelesai: proyek.selesai,
      
      mandor: proyek.mandor ? {
        id: proyek.mandor.id,
        nama: proyek.mandor.nama,
        telpon: proyek.mandor.telpon,
      } : {
        id: '',
        nama: 'Belum ditentukan',
        telpon: null,
      },
      
      // Testimoni data untuk UI logic
      testimoniData: testimoni ? {
        id: testimoni.id,
        rating: testimoni.rating,
        komentar: testimoni.komentar,
        approved: testimoni.approved || false,
        createdAt: testimoni.createdAt,
      } : null,
      
      // Backward compatibility
      hasTestimoni: !!testimoni,
    }

    return { success: true, data: proyekData }

  } catch (error) {
    console.error('❌ Error fetching proyek detail for client:', error)
    return { 
      success: false, 
      error: 'Gagal memuat detail proyek', 
      data: null 
    }
  }
}

//    Helper dipindahkan ke utils atau langsung di komponen
// Tidak perlu export di server action karena akan error