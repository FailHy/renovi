// app/(dashboard)/klien/proyek/[id]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DetailProyekKlienClient } from './DetailProyekClient'

import { getProyekDetailForClient } from '@/lib/actions/klien/proyekKlien'
import { getMilestonesByProyekId } from '@/lib/actions/shared/milestoneShared'
import { getBahanByProyekId } from '@/lib/actions/shared/bahanShared'

// Force dynamic untuk data realtime
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DetailProyekKlienPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  try {
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

    //  LANGKAH 1: Ambil Data Proyek (SINGLE SOURCE OF TRUTH)
    // Progress sudah ada di response, tidak perlu hitung ulang
    const proyekResult = await getProyekDetailForClient(id, session.user.id)

    if (!proyekResult.success) {
      if (proyekResult.error?.includes('tidak ditemukan') || 
          proyekResult.error?.includes('tidak memiliki akses')) {
        notFound()
      }
      throw new Error(proyekResult.error || 'Gagal memuat proyek')
    }

    if (!proyekResult.data) {
      notFound()
    }

    const proyek = proyekResult.data

    //  LANGKAH 2: Ambil Milestones (untuk display list, bukan hitung progress)
    let milestones: any[] = []
    try {
      const milestonesResult = await getMilestonesByProyekId(
        id, 
        session.user.id, 
        'pelanggan'
      )
      
      if (milestonesResult.success && milestonesResult.data) {
        milestones = milestonesResult.data.map(m => ({
          id: m.id,
          nama: m.nama,
          deskripsi: m.deskripsi,
          status: m.status,
          targetSelesai: m.tanggal,
          tanggalSelesai: m.selesai
        }))
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
      milestones = []
    }

    //  LANGKAH 3: Ambil Bahan Material
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
    } catch (error) {
      console.error('  Error fetching bahan:', error)
      bahan = []
    }

    //  LANGKAH 4: Pass data ke Client Component
    // PENTING: Tidak ada perhitungan ulang progress di sini!
    const proyekForClient = {
      id: proyek.id,
      nama: proyek.nama,
      tipeLayanan: proyek.tipeLayanan,
      deskripsi: proyek.deskripsi,
      alamat: proyek.alamat,
      
      //  LANGSUNG DARI DATABASE - NO CALCULATION
      status: proyek.status,
      progress: proyek.progress,
      
      tanggalMulai: new Date(proyek.tanggalMulai),
      tanggalSelesai: proyek.tanggalSelesai ? new Date(proyek.tanggalSelesai) : null,
      mandor: proyek.mandor,
      testimoniData: proyek.testimoniData,
      hasTestimoni: proyek.hasTestimoni,
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
      throw error
    }
    
    redirect('/klien/proyek')
  }
}