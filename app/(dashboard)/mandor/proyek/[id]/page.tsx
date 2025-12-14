// FILE: app/(dashboard)/mandor/proyek/[id]/page.tsx
// ========================================
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getProjectById } from '@/lib/actions/mandor/proyek'
import { getMilestonesByProjectId } from '@/lib/actions/mandor/milestone'
import { DetailProyekClient } from './DetailProyekClient'

export default async function DetailProyekMandorPage({
  params
}: {
  params: Promise<{ id: string }> //  params adalah Promise
}) {
  const session = await getServerSession(authOptions)

  // Authorization check
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized')
  }

  //  UNWRAP params dengan await
  const { id } = await params
  const mandorId = session.user.id

  // Fetch data using server actions -  tambahkan mandorId
  const [projectResult, milestonesResult] = await Promise.all([
    getProjectById(id, mandorId), //  kirim mandorId
    getMilestonesByProjectId(id, mandorId) //  kirim mandorId
  ])

  // Handle unauthorized or not found
  if (!projectResult.success) {
    if (projectResult.error === 'Akses ditolak' || projectResult.error === 'Unauthorized') {
      redirect('/unauthorized')
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
          {projectResult.error || 'Proyek tidak ditemukan'}
        </p>
        <a href="/mandor" className="text-light-primary dark:text-dark-primary hover:underline">
          Kembali ke Dashboard
        </a>
      </div>
    )
  }

  if (!milestonesResult.success) {
    console.error('Failed to fetch milestones:', milestonesResult.error)
  }

  // Pass data to client component
  return (
    <DetailProyekClient
      project={projectResult.data} //  fixed: projects -> project
      initialMilestones={milestonesResult.data || []} //  fixed: initialMilestone -> initialMilestones
      mandor={{
        id: session.user.id,
        nama: session.user.name || 'Mandor'
      }}
    />
  )
}