// FILE: app/(dashboard)/mandor/page.tsx
// ========================================
// HOME DASHBOARD MANDOR
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { FolderKanban, CheckCircle2, Clock, TrendingUp, DollarSign } from 'lucide-react'
import { getMandorDashboardSummary } from '@/lib/actions/mandor/dashboard'
import { formatCurrency } from '@/lib/utils/mandorUtils'

export default async function MandorHomePage() {
  const session = await getServerSession(authOptions)

  // Authorization check
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized')
  }

  // Fetch dashboard summary
  const summaryResult = await getMandorDashboardSummary()

  // Handle errors
  if (!summaryResult.success) {
    return (
      <div>
        <DashboardHeader
          title="Dashboard Mandor"
          description={`Selamat datang, ${session.user.name}`}
        />
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500">
              {summaryResult.error || 'Gagal memuat data'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = summaryResult.data!

  const stats = [
    {
      title: 'Total Proyek',
      value: summary.projects.total,
      icon: <FolderKanban className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Proyek yang Anda handle'
    },
    {
      title: 'Proyek Selesai',
      value: summary.projects.completed,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'Sudah diselesaikan'
    },
    {
      title: 'Proyek Berlangsung',
      value: summary.projects.inProgress,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      description: 'Sedang dikerjakan'
    },
    {
      title: 'Total Milestone',
      value: summary.milestones.total,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Dari semua proyek'
    },
  ]

  return (
    <div>
      <DashboardHeader
        title="Dashboard Mandor"
        description={`Selamat datang kembali, ${session.user.name}! 👋`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Milestone Selesai
                </h3>
                <p className="text-2xl font-bold">{summary.milestones.completed}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 text-sm">
              <span className="text-light-text-secondary dark:text-dark-text-secondary">
                Dari total
              </span>
              <span className="font-medium">{summary.milestones.total} milestone</span>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ 
                  width: `${summary.milestones.total > 0 ? (summary.milestones.completed / summary.milestones.total) * 100 : 0}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Milestone Berlangsung
                </h3>
                <p className="text-2xl font-bold">{summary.milestones.inProgress}</p>
              </div>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Sedang dalam pengerjaan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Total Pengeluaran
                </h3>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.expenses.total)}
                </p>
              </div>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Dari semua proyek Anda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/mandor/proyek"
              className="flex items-center gap-3 p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-lg hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
            >
              <div className="w-10 h-10 bg-light-primary dark:bg-dark-primary rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Lihat Semua Proyek</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Kelola {summary.projects.total} proyek Anda
                </p>
              </div>
            </a>
            
            <div className="flex items-center gap-3 p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-lg opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Laporan Bulanan</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Segera hadir
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      {summary.projects.total === 0 && (
        <Card className="mt-6 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Belum Ada Proyek</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Anda belum memiliki proyek yang ditugaskan. Silakan hubungi admin untuk mendapatkan proyek.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}