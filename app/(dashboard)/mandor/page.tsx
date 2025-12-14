// RESPONSIVE PROJECT LIST PAGE
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { getMandorProjects } from '@/lib/actions/mandor/dashboard'
import { ProyekListClient } from './proyek/ProyekClientList'
import { FolderKanban, Clock, CheckCircle, AlertCircle, CalendarDays } from 'lucide-react'

export default async function ProyekListPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized')
  }

  const projectsResult = await getMandorProjects()

  if (!projectsResult.success) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Proyek</h1>
            <p className="text-gray-500">Kelola semua proyek Anda</p>
          </div>
        </div>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-gray-500">
              {projectsResult.error || 'Gagal memuat data proyek'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const projects = projectsResult.data!

  const projectsByStatus = {
    'Dalam Progress': projects.filter(p => p.status === 'Dalam Progress'),
    'Perencanaan': projects.filter(p => p.status === 'Perencanaan'),
    'Selesai': projects.filter(p => p.status === 'Selesai'),
    'Dibatalkan': projects.filter(p => p.status === 'Dibatalkan'),
  }

  // Stats configuration with updated colors
  const statsConfig = [
    {
      label: 'Total Proyek',
      value: projects.length,
      icon: FolderKanban,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900'
    },
    {
      label: 'Dalam Progress',
      value: projectsByStatus['Dalam Progress'].length,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600'
    },
    {
      label: 'Perencanaan',
      value: projectsByStatus['Perencanaan'].length,
      icon: AlertCircle,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-600'
    },
    {
      label: 'Selesai',
      value: projectsByStatus['Selesai'].length,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Daftar Proyek
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola {projects.length} proyek konstruksi Anda
          </p>
        </div>
        
        {/* Date Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-600">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <span>
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Bar - Modern Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Project List Component */}
      <ProyekListClient projects={projects} />
    </div>
  )
}