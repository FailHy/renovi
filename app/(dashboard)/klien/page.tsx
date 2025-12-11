// FILE: app/(dashboard)/klien/page.tsx - FIXED WITH PROPER HEADER
// ========================================
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { HeaderDashboardKlien } from '@/components/dashboard/HeaderDashboard'
import { FolderKanban, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function KlienDashboard() {
  const session = await getServerSession(authOptions)

  // Auth check
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'pelanggan') {
    redirect('/unauthorized')
  }

  // Fetch client's projects
  const klienProjects = await db.query.projeks.findMany({
    where: eq(projeks.pelangganId, session.user.id),
    orderBy: (projeks, { desc }) => [desc(projeks.lastUpdate)],
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

  // Calculate statistics
  const totalProyek = klienProjects.length
  const proyekAktif = klienProjects.filter(p => p.status === 'Dalam Progress').length
  const proyekSelesai = klienProjects.filter(p => p.status === 'Selesai').length
  const proyekPerencanaan = klienProjects.filter(p => p.status === 'Perencanaan').length

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Perencanaan': 'info',
      'Dalam Progress': 'warning',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
    }
    return variants[status] || 'info'
  }

  return (
    <div className="space-y-6">
      <HeaderDashboardKlien
        nama={session.user.name || 'Klien'}
        totalProyek={totalProyek}
        proyekAktif={proyekAktif}
        proyekSelesai={proyekSelesai}
        action={
          totalProyek > 0 ? (
            <Link
              href="/klien/proyek"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium shadow-sm"
            >
              <FolderKanban className="w-4 h-4" />
              Lihat Semua Proyek
            </Link>
          ) : undefined
        }
      />

      {/* STATISTIK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Proyek</p>
                <p className="text-2xl font-bold text-gray-900">{totalProyek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Perencanaan</p>
                <p className="text-2xl font-bold text-indigo-600">{proyekPerencanaan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Sedang Berjalan</p>
                <p className="text-2xl font-bold text-amber-600">{proyekAktif}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Selesai</p>
                <p className="text-2xl font-bold text-emerald-600">{proyekSelesai}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DAFTAR PROYEK */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Proyek Saya</h2>
          {totalProyek > 0 && (
            <p className="text-sm text-gray-500">
              Menampilkan {klienProjects.length} proyek
            </p>
          )}
        </div>
        
        {klienProjects.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Belum Ada Proyek
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Anda belum memiliki proyek yang sedang berjalan. Hubungi admin untuk memulai proyek baru.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Badge 
                        variant={getStatusBadge(project.status)}
                        className="ml-2"
                      >
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
        )}
      </div>
    </div>
  )
}