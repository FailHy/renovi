import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  User, 
  CheckCircle2, 
  Activity,
  CalendarDays,
  LayoutGrid
} from 'lucide-react'

export default async function KlienProyekPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'pelanggan') redirect('/unauthorized')

  // Fetch client's projects
  const klienProjects = await db.query.projeks.findMany({
    where: eq(projeks.pelangganId, session.user.id),
    orderBy: [desc(projeks.lastUpdate)],
    with: {
      mandor: {
        columns: {
          id: true,
          nama: true,
          telpon: true
        }
      }
    }
  })

  // Calculate simple stats
  const totalProyek = klienProjects.length
  const proyekAktif = klienProjects.filter(p => p.status === 'Dalam Progress').length
  const proyekSelesai = klienProjects.filter(p => p.status === 'Selesai').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dalam Progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Selesai': return 'bg-green-100 text-green-700 border-green-200'
      case 'Perencanaan': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Daftar Proyek
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola dan pantau semua proyek konstruksi Anda.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
          <CalendarDays className="w-4 h-4" />
          {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Proyek</p>
              <p className="text-3xl font-bold text-gray-900">{totalProyek}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sedang Berjalan</p>
              <p className="text-3xl font-bold text-blue-600">{proyekAktif}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Selesai</p>
              <p className="text-3xl font-bold text-green-600">{proyekSelesai}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Projects Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Semua Proyek</h2>
          </div>
        </div>

        {klienProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {klienProjects.map((project) => (
              <Link key={project.id} href={`/klien/proyek/${project.id}`}>
                <Card hover className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                          {project.nama}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {project.tipeLayanan}
                        </p>
                      </div>
                      <Badge className={`px-3 py-1 ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    {/* Deskripsi */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {project.deskripsi}
                    </p>

                    {/* Info Mandor & Lokasi */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Mandor
                          </p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {project.mandor?.nama || 'Belum ditentukan'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Lokasi
                          </p>
                          <p className="text-sm text-gray-700 truncate">
                            {project.alamat}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Progress
                        </span>
                        <span className="text-lg font-black text-gray-900">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-500 relative ${
                            project.progress >= 80 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                              : project.progress >= 50 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                              : project.progress >= 30
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                              : 'bg-gradient-to-r from-rose-500 to-rose-400'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Last Update */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-gray-500">
                          Update terakhir: <span className="font-bold text-gray-700">
                            {new Date(project.lastUpdate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Belum ada proyek</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              Anda belum memiliki proyek yang terdaftar. Hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}