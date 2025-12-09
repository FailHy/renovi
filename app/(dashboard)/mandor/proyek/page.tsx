// FILE: app/(dashboard)/mandor/proyek/page.tsx
// ========================================
// RESPONSIVE PROJECT LIST PAGE
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { getMandorProjects } from '@/lib/actions/mandor/dashboard'
import { ProyekListClient } from './ProyekClientList'
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react'

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
      <div className="space-y-6">
        {/* HEADER MANDOR - Tanpa HeaderDashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Daftar Proyek
            </h1>
            <p className="text-slate-600 mt-1">
              Kelola semua proyek Anda
            </p>
          </div>
          
          {/* Date & Time Card */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">Tanggal</p>
              <p className="text-sm font-bold text-slate-900">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {new Date().toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
        
        <Card className="bg-white border-0 shadow-md">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-slate-600">
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

  // Stats configuration
  const statsConfig = [
    {
      label: 'Total Proyek',
      value: projects.length,
      icon: FolderKanban,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-slate-900'
    },
    {
      label: 'Dalam Progress',
      value: projectsByStatus['Dalam Progress'].length,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600'
    },
    {
      label: 'Perencanaan',
      value: projectsByStatus['Perencanaan'].length,
      icon: AlertCircle,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-600'
    },
    {
      label: 'Selesai',
      value: projectsByStatus['Selesai'].length,
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header - Tidak pakai HeaderDashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Daftar Proyek
          </h1>
          <p className="text-slate-600 mt-1">
            Kelola {projects.length} proyek Anda
          </p>
        </div>
        
        {/* Date & Time Card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600">Tanggal</p>
            <p className="text-sm font-bold text-slate-900">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              {new Date().toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
      {/* Project List */}
      <ProyekListClient projects={projects} />
    </div>
  )
}