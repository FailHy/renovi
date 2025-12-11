import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DetailProyekKlienClient } from './DetailProyekClient'
// ✅ IMPORT DARI SHARED ACTIONS
import { getProyekById } from '@/lib/actions/shared/proyekShared'
import { getMilestonesByProyekId } from '@/lib/actions/shared/milestoneShared'
import { getBahanByProyekId } from '@/lib/actions/shared/bahanShared'

// Pastikan halaman selalu fresh (tidak di-cache) agar data progress realtime
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DetailProyekKlienPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  try {
    // Await params (Next.js 15)
    const { id } = await params
    
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      redirect('/login')
    }

    // Validasi role pelanggan
    if (session.user.role !== 'pelanggan') {
      redirect('/dashboard')
    }

    // ✅ LANGKAH 1: Ambil Milestones TERLEBIH DAHULU
    // Alasannya: Fungsi getMilestonesByProyekId di milestoneShared.ts mengandung logika "Self-Healing"
    // yang akan memperbaiki data progress di database jika tidak sinkron.
    let milestones: any[] = []
    
    try {
      const milestonesResult = await getMilestonesByProyekId(
        id, 
        session.user.id, 
        'pelanggan'
      )
      
      if (milestonesResult.success && milestonesResult.data) {
        // Transform data untuk UI Client
        milestones = milestonesResult.data.map(m => ({
          id: m.id,
          nama: m.nama,
          deskripsi: m.deskripsi,
          status: m.status,
          targetSelesai: m.tanggal,
          tanggalSelesai: m.selesai
        }))
      }
    } catch (milestoneError) {
      console.error('Error fetching milestones:', milestoneError)
      milestones = []
    }

    // ✅ LANGKAH 2: Ambil Data Proyek (Setelah DB di-sync oleh langkah 1)
    const proyekResult = await getProyekById(id, session.user.id, 'pelanggan')

    if (!proyekResult.success) {
      if (proyekResult.error?.includes('not found') || 
          proyekResult.error?.includes('tidak ditemukan')) {
        notFound()
      }
      if (proyekResult.error?.includes('Unauthorized')) {
        redirect('/klien/proyek') 
      }
      throw new Error(proyekResult.error || 'Gagal memuat proyek')
    }

    if (!proyekResult.data) {
      notFound()
    }

    const proyek = proyekResult.data

    // ✅ LANGKAH 3: Hitung Ulang Progress Secara Manual (Server-Side Calculation)
    // Ini menjamin angka yang dikirim ke Client Component 100% akurat berdasarkan milestone yang baru diambil,
    // mengabaikan potensi delay update di database.
    let calculatedProgress = 0
    let calculatedStatus = proyek.status

    if (milestones.length > 0) {
      const activeMilestones = milestones.filter(m => m.status !== 'Dibatalkan')
      const totalActive = activeMilestones.length
      const completedCount = activeMilestones.filter(m => m.status === 'Selesai').length
      
      if (totalActive > 0) {
        calculatedProgress = Math.round((completedCount / totalActive) * 100)
      }

      // Sinkronisasi status visual berdasarkan progress
      if (calculatedProgress === 100 && totalActive > 0) {
        calculatedStatus = 'Selesai'
      } else if (calculatedProgress > 0) {
        calculatedStatus = 'Dalam Progress'
      } else if (calculatedProgress === 0 && totalActive > 0) {
         // Jika milestone ada tapi belum ada yang selesai, status minimal 'Dalam Progress' (bukan Perencanaan)
         // agar Client tidak bingung
         if (proyek.status === 'Perencanaan') {
            calculatedStatus = 'Dalam Progress'
         }
      }
    } else {
        // Jika tidak ada milestone, gunakan data DB
        calculatedProgress = proyek.progress
    }

    // ✅ LANGKAH 4: Ambil Bahan Material
    let bahan: any[] = []
    try {
      const bahanResult = await getBahanByProyekId(
        id, 
        session.user.id, 
        'pelanggan'
      )
      
      if (bahanResult.success && bahanResult.data) {
        bahan = bahanResult.data
      }
    } catch (bahanError) {
      console.error('Error fetching bahan:', bahanError)
      bahan = []
    }

    // ✅ LANGKAH 5: Construct Object untuk Client Component
    const proyekForClient = {
      id: proyek.id,
      nama: proyek.nama,
      tipeLayanan: proyek.tipeLayanan,
      deskripsi: proyek.deskripsi,
      alamat: proyek.alamat,
      // PENTING: Gunakan nilai hasil kalkulasi ulang, bukan mentah dari DB
      status: calculatedStatus, 
      progress: calculatedProgress, 
      
      tanggalMulai: new Date(proyek.tanggalMulai),
      tanggalSelesai: proyek.tanggalSelesai ? new Date(proyek.tanggalSelesai) : null,
      mandor: proyek.mandor ? {
        id: proyek.mandor.id,
        nama: proyek.mandor.nama,
        telpon: proyek.mandor.telpon
      } : {
        id: '',
        nama: 'Belum ditentukan',
        telpon: null
      },
      hasTestimoni: proyek.hasTestimoni,
      testimoniData: null 
    }

    return (
      <DetailProyekKlienClient
        proyek={proyekForClient}
        milestones={milestones}
        bahan={bahan}
        klienId={session.user.id}
      />
    )

  } catch (error) {
    console.error('❌ Error in DetailProyekKlienPage:', error)
    
    if (process.env.NODE_ENV === 'development') {
       throw error;
    }
    
    redirect('/klien/proyek')
  }
}