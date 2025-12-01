// FILE: app/(dashboard)/mandor/proyek/page.tsx
// ========================================
// LIST SEMUA PROYEK MANDOR
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { FolderKanban, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { getMandorProjects } from '@/lib/actions/mandor/dashboard'
import { ProyekListClient } from './ProyekClientList'

export default async function ProyekListPage() {
  const session = await getServerSession(authOptions)

  // Authorization check
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized')
  }

  // Fetch projects
  const projectsResult = await getMandorProjects()

  // Handle errors
  if (!projectsResult.success) {
    return (
      <div>
        <DashboardHeader
          title="Daftar Proyek"
          description="Kelola semua proyek Anda"
        />
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500">
              {projectsResult.error || 'Gagal memuat data proyek'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projects = projectsResult.data!

  // Group projects by status
  const projectsByStatus = {
    'Dalam Progress': projects.filter(p => p.status === 'Dalam Progress'),
    'Perencanaan': projects.filter(p => p.status === 'Perencanaan'),
    'Selesai': projects.filter(p => p.status === 'Selesai'),
    'Dibatalkan': projects.filter(p => p.status === 'Dibatalkan'),
  }

  return (
    <div>
      <DashboardHeader
        title="Daftar Proyek"
        description={`Kelola ${projects.length} proyek Anda`}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Total Proyek
            </p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Dalam Progress
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {projectsByStatus['Dalam Progress'].length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Perencanaan
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {projectsByStatus['Perencanaan'].length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Selesai
            </p>
            <p className="text-2xl font-bold text-green-600">
              {projectsByStatus['Selesai'].length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Component for Search & Filter */}
      <ProyekListClient projects={projects} />
    </div>
  )
}