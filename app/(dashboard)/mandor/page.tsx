import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { getMandorDashboardSummary } from '@/lib/actions/mandor/dashboard'
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Flag,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export default async function MandorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'mandor') {
    redirect('/unauthorized')
  }

  // Fetch dashboard summary
  const summaryResult = await getMandorDashboardSummary()
  
  if (!summaryResult.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {summaryResult.error || 'Gagal memuat data dashboard'}
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = summaryResult.data

  const stats = [
    {
      title: 'Total Proyek',
      value: data.projects.total,
      icon: FolderKanban,
      color: 'bg-blue-500',
      description: `${data.projects.inProgress} sedang berjalan`
    },
    {
      title: 'Proyek Selesai',
      value: data.projects.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Proyek berhasil diselesaikan'
    },
    {
      title: 'Milestone Aktif',
      value: data.milestones.inProgress,
      icon: Flag,
      color: 'bg-purple-500',
      description: `${data.milestones.pending} menunggu`
    },
    {
      title: 'Total Pengeluaran',
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.expenses.total),
      icon: DollarSign,
      color: 'bg-amber-500',
      description: 'Akumulasi biaya bahan'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Mandor</h1>
          <p className="text-gray-500">Selamat datang kembali, {session.user.name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/mandor/proyek" 
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <FolderKanban className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-700">Kelola Proyek</span>
              </Link>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl text-gray-400 cursor-not-allowed">
                <AlertCircle className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Laporan (Segera)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Summary */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Proyek</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Perencanaan</span>
                </div>
                <span className="font-bold text-gray-900">{data.projects.planning}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Dalam Progress</span>
                </div>
                <span className="font-bold text-gray-900">{data.projects.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Selesai</span>
                </div>
                <span className="font-bold text-gray-900">{data.projects.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}