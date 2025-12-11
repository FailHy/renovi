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
    </div>
  )
}