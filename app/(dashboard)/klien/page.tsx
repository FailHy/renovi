// FILE: app/(dashboard)/klien/page.tsx
// ========================================
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projeks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { FolderKanban } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default async function KlienDashboard() {
  const session = await getServerSession(authOptions)

  // Fetch client's projects
  const klienProjects = await db.query.projeks.findMany({
    where: eq(projeks.pelangganId, session!.user.id),
    orderBy: (projeks, { desc }) => [desc(projeks.lastUpdate)],
    with: {
      mandor: true,
    },
  })

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
    <div>
      <DashboardHeader
        title="Dashboard Klien"
        description={`Selamat datang, ${session!.user.name}`}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Proyek Saya</h2>
        
        {klienProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Belum ada proyek
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {klienProjects.map((project) => (
              <Link key={project.id} href={`/klien/proyek/${project.id}`}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">{project.nama}</h3>
                      <Badge variant={getStatusBadge(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2">
                      {project.deskripsi}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Mandor:
                        </span>
                        <span className="ml-2 font-medium">
                          {project.mandor?.nama || 'Belum ditentukan'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Tipe:
                        </span>
                        <span className="ml-2">{project.tipeLayanan}</span>
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