// FILE: app/(dashboard)/mandor/proyek/[id]/page.tsx
// ========================================
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getProjectById } from '@/lib/actions/mandor/proyek'
import { getMilestonesByProjectId } from '@/lib/actions/mandor/milestone' // Pastikan nama fungsi import benar
import { DetailProyekClient } from './DetailProyekClient'

export default async function DetailProyekMandorPage({
  params
}: {
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession(authOptions)

  // Authorization check
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized')
  }

  // 1. UNWRAP params dengan await
  const { id } = await params
  
  // 2. Fetch data HANYA menggunakan 'id' (Project ID)
  // mandorId tidak perlu dikirim karena sudah diambil otomatis di dalam server action via session
  const [projectResult, milestonesResult] = await Promise.all([
    getProjectById(id), 
    getMilestonesByProjectId(id) 
  ])

  // Handle unauthorized or not found
  if (!projectResult.success || !projectResult.data) {
    if (projectResult.error === 'Akses ditolak' || projectResult.error === 'Unauthorized') {
      redirect('/unauthorized')
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">
          {projectResult.error || 'Proyek tidak ditemukan'}
        </p>
        <a href="/mandor/proyek" className="text-blue-600 hover:underline">
          Kembali ke Daftar Proyek
        </a>
      </div>
    )
  }

  // Log error milestone jika ada, tapi jangan block halaman
  if (!milestonesResult.success) {
    console.error('Failed to fetch milestones:', milestonesResult.error)
  }

  // 3. Pass data to client component
  // Pastikan properti yang dikirim sesuai dengan interface di DetailProyekClient
  return (
    <DetailProyekClient
      project={(projectResult.data || []) as any}
      initialMilestones={(milestonesResult.data || []) as any}
      mandor={{
        id: session.user.id,
        nama: session.user.name || 'Mandor'
      }}
    />
  )
}