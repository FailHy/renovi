// app/(dashboard)/klien/proyek/[id]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DetailProyekKlienClient } from './DetailProyekClient'
// ✅ IMPORT DARI SHARED ACTIONS
import { getProyekById } from '@/lib/actions/shared/proyekShared'
import { getMilestonesByProyekId } from '@/lib/actions/shared/milestoneShared'
import { getBahanByProyekId } from '@/lib/actions/shared/bahanShared'
import { any } from 'zod'
export default async function DetailProyekKlienPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  try {
    // Await params (Next.js 15)
    const { id } = await params
    
    console.log('=== KLIEN PROJECT PAGE DEBUG ===')
    console.log('Project ID from params:', id)
    
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('❌ No user session found')
      redirect('/login')
    }

    console.log('User session data:', {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name
    })

    // Validasi role pelanggan
    if (session.user.role !== 'pelanggan') {
      console.log('❌ Access denied - Wrong role:', session.user.role)
      redirect('/dashboard')
    }

    // ✅ FIX 1: Fetch project menggunakan shared action dengan role
    console.log('Fetching project data for klien...')
    
    const proyekResult = await getProyekById(id, session.user.id, 'pelanggan')
    
    console.log('Project fetch result:', {
      success: proyekResult.success,
      error: proyekResult.error,
      dataExists: !!proyekResult.data,
      projectName: proyekResult.data?.nama || 'No name'
    })

    // Handle error states
    if (!proyekResult.success) {
      console.error('Failed to fetch project:', proyekResult.error)
      
      if (proyekResult.error?.includes('not found') || 
          proyekResult.error?.includes('tidak ditemukan')) {
        notFound()
      }
      
      if (proyekResult.error?.includes('Unauthorized') ||
          proyekResult.error?.includes('akses')) {
        redirect('/klien/proyek') // Redirect ke list proyek
      }
      
      throw new Error(proyekResult.error || 'Gagal memuat proyek')
    }

    if (!proyekResult.data) {
      console.log('❌ Project data is null/undefined')
      notFound()
    }

    const proyek = proyekResult.data
    console.log('✅ Project loaded successfully:', {
      id: proyek.id,
      name: proyek.nama,
      status: proyek.status,
      // progress: proyek.progress,
      mandorId: proyek.mandorId,
      mandorName: proyek.mandor?.nama
    })

    // ✅ FIX 2: Fetch milestones menggunakan shared action
    let milestones: any[]
    try {
      console.log('Fetching milestones...')
      const milestonesResult = await getMilestonesByProyekId(
        id, 
        session.user.id, 
        'pelanggan'
      )
      
      if (milestonesResult.success && milestonesResult.data) {
        // ✅ Transform data untuk match dengan UI expectations
        milestones = milestonesResult.data.map(m => ({
          id: m.id,
          nama: m.nama,
          deskripsi: m.deskripsi,
          status: m.status,
          targetSelesai: m.tanggal, // Gunakan tanggal sebagai target
          tanggalSelesai: m.selesai
        }))
        console.log(`✅ Loaded ${milestones.length} milestones`)
      } else {
        console.warn('⚠️ Failed to load milestones:', milestonesResult.error)
        milestones = []
      }
    } catch (milestoneError) {
      console.error('Error fetching milestones:', milestoneError)
      milestones = []
    }

    // ✅ FIX 3: Fetch bahan materials menggunakan shared action
    let bahan: any[]
    try {
      console.log('Fetching bahan materials...')
      
      const bahanResult = await getBahanByProyekId(
        id, 
        session.user.id, 
        'pelanggan'
      )
      
      if (bahanResult.success && bahanResult.data) {
        // ✅ Data sudah dalam format yang benar dengan relasi nota
        bahan = bahanResult.data
        console.log(`✅ Loaded ${bahan.length} bahan items`)
      } else {
        console.warn('⚠️ Failed to load bahan:', bahanResult.error)
        bahan = []
      }
    } catch (bahanError) {
      console.error('Error fetching bahan:', bahanError)
      bahan = []
    }

    // ✅ Transform proyek data untuk match dengan UI - PERBAIKI INI!
const proyekForClient = {
  id: proyek.id,
  nama: proyek.nama,
  tipeLayanan: proyek.tipeLayanan,
  deskripsi: proyek.deskripsi,
  alamat: proyek.alamat,
  status: proyek.status,
  progress: proyek.progress,
  tanggalMulai: proyek.tanggalMulai,
  tanggalSelesai: proyek.tanggalSelesai,
  mandor: proyek.mandor ? {
    id: proyek.mandor.id,
    nama: proyek.mandor.nama,
    telpon: proyek.mandor.telpon
  } : {
    id: '',
    nama: 'Belum ditentukan',
    telpon: null
  },
  hasTestimoni: proyek.hasTestimoni, // Masih ada untuk backward compatibility
  testimoniData: proyek.testimoniData // Menambahkan
}

console.log('=== PAGE DATA SUMMARY ===')
console.log('- Project:', proyekForClient.nama)
console.log('- Mandor:', proyekForClient.mandor.nama)
console.log('- Milestones:', milestones.length)
console.log('- Bahan items:', bahan.length)
console.log('- Has Testimoni:', proyekForClient.hasTestimoni)
console.log('- Testimoni Data:', proyekForClient.testimoniData) // ✅ Tambah log ini
console.log('========================')

    return (
      <DetailProyekKlienClient
        proyek={proyekForClient}
        milestones={milestones}
        bahan={bahan}
        klienId={session.user.id}
      />
    )

  } catch (error) {
    console.error('❌ CRITICAL ERROR in DetailProyekKlienPage:', error)
    
    // Better error handling untuk development
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">
              ⚠️ Development Error
            </h1>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-red-600">Error Message:</p>
                <p className="mt-1 text-red-700">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
              
              {error instanceof Error && error.stack && (
                <div>
                  <p className="font-semibold text-red-600 mb-2">Stack Trace:</p>
                  <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    
    // Untuk production, redirect ke halaman error
    redirect('/klien/proyek')
  }
}