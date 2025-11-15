// FILE: app/(dashboard)/mandor/page.tsx
// ========================================
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { FolderKanban, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function MandorDashboard() {
  const session = await getServerSession(authOptions)

  // Fetch mandor's projects
  const [totalProjects, completedProjects, inProgressProjects, mandorProjects] = await Promise.all([
    db.select({ count: count() }).from(projeks).where(eq(projeks.mandorId, session!.user.id)),
    db
      .select({ count: count() })
      .from(projeks)
      .where(and(eq(projeks.mandorId, session!.user.id), eq(projeks.status, 'Selesai'))),
    db
      .select({ count: count() })
      .from(projeks)
      .where(and(eq(projeks.mandorId, session!.user.id), eq(projeks.status, 'Dalam Progress'))),
    db.query.projeks.findMany({
      where: eq(projeks.mandorId, session!.user.id),
      orderBy: (projeks, { desc }) => [desc(projeks.lastUpdate)],
      with: {
        pelanggan: true,
      },
    }),
  ])

  const stats = [
    {
      title: 'Total Proyek',
      value: totalProjects[0].count,
      icon: <FolderKanban className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Proyek Selesai',
      value: completedProjects[0].count,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Proyek Berlangsung',
      value: inProgressProjects[0].count,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Perencanaan': 'badge-info',
      'Dalam Progress': 'badge-warning',
      'Selesai': 'badge-success',
      'Dibatalkan': 'badge-danger',
    }
    return variants[status] || 'badge-info'
  }

  return (
    <div>
      <DashboardHeader
        title="Dashboard Mandor"
        description={`Selamat datang, ${session!.user.name}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Proyek Anda</h2>
        
        {mandorProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Belum ada proyek yang ditugaskan
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mandorProjects.map((project) => (
              <Link key={project.id} href={`/mandor/proyek/${project.id}`}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">{project.nama}</h3>
                      <span className={`badge ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2">
                      {project.deskripsi}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Pelanggan:
                        </span>
                        <span className="ml-2 font-medium">{project.pelanggan.nama}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Lokasi:
                        </span>
                        <span className="ml-2">{project.alamat}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Progress
                        </span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-light-primary dark:bg-dark-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
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