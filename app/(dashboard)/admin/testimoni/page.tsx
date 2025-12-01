'use client'

import { useState } from 'react'
import { Check, X, Search, Star, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { approveTestimoni, rejectTestimoni } from '@/lib/actions/admin/testimoni'
import { formatDate } from '@/lib/utils'

// ✅ Type Definition
interface TestimoniData {
  id: string
  komentar: string
  rating: number
  gambar: string | null
  approved: boolean
  approvedAt: string | null
  posting: string
  user: {
    nama: string
    email: string
  }
  projek: {
    nama: string
    tipeLayanan: string
  }
  approver: {
    nama: string
    email?: string
  } | null
}

// ✅ Mock data dengan type yang benar
const mockTestimonis: TestimoniData[] = [
  {
    id: '1',
    komentar:
      'Sangat puas dengan hasil renovasi! Tim Renovi sangat profesional, komunikatif, dan hasil kerjanya rapi. Dapur dan kamar mandi sekarang terlihat seperti baru dengan desain yang modern. Highly recommended!',
    rating: 5,
    gambar: '/images/testimonials/test-1.jpg',
    approved: true,
    approvedAt: '2024-02-22',
    posting: '2024-02-21',
    user: {
      nama: 'Dewi Lestari',
      email: 'dewi@email.com',
    },
    projek: {
      nama: 'Renovasi Dapur & Kamar Mandi',
      tipeLayanan: 'Renovasi Rumah',
    },
    approver: {
      nama: 'Administrator Renovi',
      email: 'admin@renovi.com',
    },
  },
  {
    id: '2',
    komentar:
      'Taman rumah saya sekarang jadi lebih asri dan indah. Konsep minimalis tropisnya pas banget dengan suasana rumah. Terima kasih Renovi dan tim untuk pekerjaan yang luar biasa!',
    rating: 5,
    gambar: '/images/testimonials/test-2.jpg',
    approved: true,
    approvedAt: '2023-12-17',
    posting: '2023-12-16',
    user: {
      nama: 'Dewi Lestari',
      email: 'dewi@email.com',
    },
    projek: {
      nama: 'Landscaping Taman',
      tipeLayanan: 'Landscaping',
    },
    approver: {
      nama: 'Administrator Renovi',
      email: 'admin@renovi.com',
    },
  },
  {
    id: '3',
    komentar:
      'Pembangunan rumah berjalan sesuai timeline. Mandor yang ditugaskan sangat responsif dan selalu update progress. Material yang digunakan juga berkualitas. Recommended!',
    rating: 4,
    gambar: null,
    approved: false,
    approvedAt: null,
    posting: '2024-03-20',
    user: {
      nama: 'Eko Prasetyo',
      email: 'eko@email.com',
    },
    projek: {
      nama: 'Pembangunan Rumah Tinggal 2 Lantai',
      tipeLayanan: 'Konstruksi Bangunan',
    },
    approver: null,
  },
]

export default function ManajemenTestimoniPage() {
  
  const [testimonis, setTestimonis] = useState<TestimoniData[]>(mockTestimonis)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [selectedTestimoni, setSelectedTestimoni] = useState<TestimoniData | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [actionTestimoni, setActionTestimoni] = useState<TestimoniData | null>(null)

  const filteredTestimonis = testimonis.filter((testimoni) => {
    const matchSearch =
      testimoni.user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimoni.komentar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimoni.projek.nama.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus =
      filterStatus === ''
        ? true
        : filterStatus === 'approved'
        ? testimoni.approved
        : !testimoni.approved

    const matchRating = filterRating
      ? testimoni.rating === parseInt(filterRating)
      : true

    return matchSearch && matchStatus && matchRating
  })

  const handleViewDetail = (testimoni: TestimoniData) => {
    setSelectedTestimoni(testimoni)
    setIsDetailModalOpen(true)
  }

  const handleAction = (testimoni: TestimoniData, type: 'approve' | 'reject') => {
    setActionTestimoni(testimoni)
    setActionType(type)
    setIsActionModalOpen(true)
  }

  const confirmAction = async () => {
    if (!actionTestimoni) return

    try {
      if (actionType === 'approve') {
        // ✅ Approve testimoni dengan type yang benar
        setTestimonis(
          testimonis.map((t) =>
            t.id === actionTestimoni.id
              ? {
                  ...t,
                  approved: true,
                  approvedAt: new Date().toISOString(),
                  approver: {
                    nama: 'Administrator Renovi',
                    email: 'admin@renovi.com',
                  },
                }
              : t
          )
        )
        alert('Testimoni berhasil disetujui!')
      } else {
        // ✅ Reject (delete) testimoni
        setTestimonis(testimonis.filter((t) => t.id !== actionTestimoni.id))
        alert('Testimoni berhasil ditolak!')
      }

      setIsActionModalOpen(false)
      setActionTestimoni(null)
      setIsDetailModalOpen(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan!')
    }
  }

  const getStats = () => {
    const approved = testimonis.filter((t) => t.approved).length
    const pending = testimonis.filter((t) => !t.approved).length
    const avgRating =
      testimonis.length > 0
        ? testimonis.reduce((acc, t) => acc + t.rating, 0) / testimonis.length
        : 0
    return { approved, pending, avgRating: avgRating.toFixed(1) }
  }

  const stats = getStats()

  const renderStars = (rating: number, size: string = 'w-5 h-5') => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader
        title="Manajemen Testimoni"
        description="Kelola dan review testimoni dari klien"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Total Testimoni
                </p>
                <p className="text-3xl font-bold">{testimonis.length}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-light-primary dark:text-dark-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <X className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Rata-rata Rating
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{stats.avgRating}</p>
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <Check className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama klien, proyek, atau komentar..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="select"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Testimoni Grid */}
      {filteredTestimonis.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {searchTerm || filterStatus || filterRating
                ? 'Tidak ada testimoni yang ditemukan'
                : 'Belum ada testimoni'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTestimonis.map((testimoni) => (
            <Card key={testimoni.id} hover>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-light-primary/10 dark:bg-dark-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimoni.user.nama}</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {formatDate(testimoni.posting)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={testimoni.approved ? 'success' : 'warning'}>
                    {testimoni.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="mb-3">{renderStars(testimoni.rating)}</div>

                {/* Project Info */}
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium">{testimoni.projek.nama}</p>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {testimoni.projek.tipeLayanan}
                  </p>
                </div>

                {/* Comment */}
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-3">
                  "{testimoni.komentar}"
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                   
                    variant="outline"
                    onClick={() => handleViewDetail(testimoni)}
                    className="flex-1"
                  >
                    Detail
                  </Button>
                  {!testimoni.approved && (
                    <>
                      <Button
                       
                        onClick={() => handleAction(testimoni, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                       
                        variant="danger"
                        onClick={() => handleAction(testimoni, 'reject')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Testimoni"
        size="lg"
      >
        {selectedTestimoni && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-light-primary/10 dark:bg-dark-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-light-primary dark:text-dark-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {selectedTestimoni.user.nama}
                </p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {selectedTestimoni.user.email}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2 block">
                Rating
              </label>
              <div className="flex items-center gap-3">
                {renderStars(selectedTestimoni.rating, 'w-6 h-6')}
                <span className="text-lg font-semibold">
                  {selectedTestimoni.rating}/5
                </span>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2 block">
                Proyek
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">{selectedTestimoni.projek.nama}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {selectedTestimoni.projek.tipeLayanan}
                </p>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2 block">
                Komentar
              </label>
              <p className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                "{selectedTestimoni.komentar}"
              </p>
            </div>

            {/* Image */}
            {selectedTestimoni.gambar && (
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2 block">
                  Foto
                </label>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={selectedTestimoni.gambar}
                    alt="Testimoni"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Status Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                  Status
                </label>
                <Badge
                  variant={selectedTestimoni.approved ? 'success' : 'warning'}
                >
                  {selectedTestimoni.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                  Tanggal Posting
                </label>
                <p>{formatDate(selectedTestimoni.posting)}</p>
              </div>
            </div>

            {selectedTestimoni.approved && selectedTestimoni.approver && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                    Approved Oleh
                  </label>
                  <p>{selectedTestimoni.approver.nama}</p>
                </div>
                {selectedTestimoni.approvedAt && (
                  <div>
                    <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                      Tanggal Approve
                    </label>
                    <p>{formatDate(selectedTestimoni.approvedAt)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
              {!selectedTestimoni.approved && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleAction(selectedTestimoni, 'reject')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleAction(selectedTestimoni, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={actionType === 'approve' ? 'Approve Testimoni' : 'Tolak Testimoni'}
      >
        <p className="mb-6">
          Apakah Anda yakin ingin{' '}
          <strong>{actionType === 'approve' ? 'menyetujui' : 'menolak'}</strong>{' '}
          testimoni dari <strong>{actionTestimoni?.user.nama}</strong>?
          {actionType === 'reject' && (
            <span className="block mt-2 text-red-600">
              Testimoni yang ditolak akan dihapus secara permanen.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsActionModalOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={confirmAction}
            variant={actionType === 'approve' ? 'primary' : 'danger'}
            className={
              actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''
            }
          >
            Ya, {actionType === 'approve' ? 'Approve' : 'Tolak'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}