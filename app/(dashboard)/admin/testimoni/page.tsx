'use client'

import { useState, useEffect } from 'react'
import { Check, X, Search, Star, MessageSquare, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { HeaderManajemenTestimoni } from '@/components/dashboard/HeaderDashboard'
import { approveTestimoni, rejectTestimoni, getTestimonis } from '@/lib/actions/admin/testimoni'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface TestimoniData {
  id: string
  komentar: string
  rating: number
  gambar: string | null
  approved: boolean
  approvedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  userId: string
  projectId: string
  approvedBy: string | null
  user: {
    id: string
    name: string
    email: string
  } | null
  project: {
    id: string
    name: string
    type: string
  } | null
  approver: {
    id: string
    name: string
    email: string
  } | null
}

export default function ManajemenTestimoniPage() {
  const [testimonis, setTestimonis] = useState<TestimoniData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [selectedTestimoni, setSelectedTestimoni] = useState<TestimoniData | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [actionTestimoni, setActionTestimoni] = useState<TestimoniData | null>(null)

  //  Fetch data real dari database
  useEffect(() => {
    fetchTestimonis()
  }, [])

  const fetchTestimonis = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Fetching testimonials from admin...')
      
      const result = await getTestimonis()
      
      console.log('📊 API Response:', result)
      
      if (result.success && result.data) {
        //  UPDATE: Transform data dari database ke format yang sesuai
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedTestimonis: TestimoniData[] = result.data.map((item: any) => ({
          id: item.id,
          komentar: item.comment || item.komentar || '',
          rating: item.rating || 0,
          gambar: item.image || item.gambar || null,
          approved: item.approved || false,
          approvedAt: item.approvedAt || null,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          userId: item.userId,
          projectId: item.projectId,
          approvedBy: item.approvedBy,
          user: {
            id: item.user?.id || '',
            name: item.user?.name || item.user?.nama || 'N/A',
            email: item.user?.email || 'N/A'
          },
          project: {
            id: item.project?.id || '',
            name: item.project?.name || item.project?.nama || 'Proyek Tanpa Nama',
            type: item.project?.type || item.project?.tipeLayanan || 'Layanan'
          },
          approver: item.approver ? {
            id: item.approver.id || '',
            name: item.approver.name || item.approver.nama || 'Administrator',
            email: item.approver.email || ''
          } : null
        }))
        
        console.log(`   Loaded ${formattedTestimonis.length} testimonials`)
        setTestimonis(formattedTestimonis)
        toast.success(`Data testimoni berhasil dimuat (${formattedTestimonis.length} data)`)
      } else {
        console.error('❌ Failed to load testimonials:', result.error)
        toast.error(result.error || 'Gagal memuat testimoni')
      }
    } catch (error) {
      console.error('❌ Error fetching testimonials:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTestimonis = testimonis.filter((testimoni) => {
    const matchSearch =
      testimoni.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimoni.komentar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimoni.project?.name?.toLowerCase().includes(searchTerm.toLowerCase())

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
      // PERBAIKAN: Definisi tipe eksplisit untuk result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: { success: boolean; error?: string; data?: any }
      
      if (actionType === 'approve') {
        //  Approve testimoni dengan data real
        result = await approveTestimoni(actionTestimoni.id)
        
        if (result.success) {
          // Update state dengan data yang sudah diapprove
          setTestimonis(
            testimonis.map((t) =>
              t.id === actionTestimoni.id
                ? {
                    ...t,
                    approved: true,
                    approvedAt: new Date().toISOString(),
                    approver: {
                      id: result.data?.approvedBy || '',
                      name: 'Administrator Renovi',
                      email: 'admin@renovi.com'
                    }
                  }
                : t
            )
          )
          toast.success('Testimoni berhasil disetujui!')
        } else {
          toast.error(result.error || 'Gagal menyetujui testimoni')
        }
      } else {
        //  Reject (delete) testimoni dengan data real
        result = await rejectTestimoni(actionTestimoni.id)
        
        if (result.success) {
          setTestimonis(testimonis.filter((t) => t.id !== actionTestimoni.id))
          toast.success('Testimoni berhasil ditolak!')
        } else {
          toast.error(result.error || 'Gagal menolak testimoni')
        }
      }

      // Refresh data setelah action
      fetchTestimonis()
      
      setIsActionModalOpen(false)
      setActionTestimoni(null)
      setIsDetailModalOpen(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat memproses testimoni')
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
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <HeaderManajemenTestimoni />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat testimoni...</p>
            <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* bagian testimoni */}
      <HeaderManajemenTestimoni />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Waiting For Approval</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Rata-rata Rating
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-yellow-400">{stats.avgRating}</p>
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-emerald-600 opacity-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama klien, proyek, atau komentar..."
                className="w-full px-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Dropdown dengan style yang diperbaiki */}
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="" className="text-gray-500">Semua Status</option>
                <option value="approved" className="text-gray-700">Approved</option>
                <option value="pending" className="text-gray-700">Pending</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 appearance-none cursor-pointer"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="" className="text-gray-500">Semua Rating</option>
                <option value="5" className="text-gray-700">5 Bintang</option>
                <option value="4" className="text-gray-700">4 Bintang</option>
                <option value="3" className="text-gray-700">3 Bintang</option>
                <option value="2" className="text-gray-700">2 Bintang</option>
                <option value="1" className="text-gray-700">1 Bintang</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimoni Grid */}
      {filteredTestimonis.length === 0 ? (
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              {searchTerm || filterStatus || filterRating
                ? 'Tidak ada testimoni yang ditemukan'
                : 'Belum ada testimoni'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Coba ubah filter pencarian Anda
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTestimonis.map((testimoni) => (
            <Card key={testimoni.id} className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center border border-blue-200">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimoni.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(testimoni.createdAt as string)}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={testimoni.approved ? 'success' : 'warning'}
                    className={testimoni.approved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}
                  >
                    {testimoni.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="mb-4 flex items-center gap-2">
                  {renderStars(testimoni.rating)}
                  <span className="text-sm font-medium text-gray-700">{testimoni.rating}/5</span>
                </div>

                {/* Project Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{testimoni.project?.name || 'Proyek Tanpa Nama'}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {testimoni.project?.type || 'Layanan'}
                  </p>
                </div>

                {/* Comment */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 italic">
                  &quot;{testimoni.komentar}&quot;
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetail(testimoni)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  >
                    Detail
                  </Button>
                  {!testimoni.approved && (
                    <>
                      <Button
                        onClick={() => handleAction(testimoni, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleAction(testimoni, 'reject')}
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600"
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center border border-blue-200">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900">
                  {selectedTestimoni.user?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTestimoni.user?.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rating
              </label>
              <div className="flex items-center gap-3">
                {renderStars(selectedTestimoni.rating, 'w-6 h-6')}
                <span className="text-lg font-semibold text-gray-900">
                  {selectedTestimoni.rating}/5
                </span>
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Proyek
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{selectedTestimoni.project?.name || 'Proyek Tanpa Nama'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTestimoni.project?.type || 'Layanan'}
                </p>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Komentar
              </label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 italic">
                &quot;{selectedTestimoni.komentar}&quot;
              </div>
            </div>

            {/* Image */}
            {selectedTestimoni.gambar && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Foto
                </label>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Badge
                  variant={selectedTestimoni.approved ? 'success' : 'warning'}
                  className={selectedTestimoni.approved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}
                >
                  {selectedTestimoni.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tanggal Posting
                </label>
                <p className="text-gray-900">{formatDate(selectedTestimoni.createdAt as string)}</p>
              </div>
            </div>

            {selectedTestimoni.approved && selectedTestimoni.approver && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Approved Oleh
                  </label>
                  <p className="text-gray-900">{selectedTestimoni.approver.name || 'Administrator'}</p>
                </div>
                {selectedTestimoni.approvedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Tanggal Approve
                    </label>
                    <p className="text-gray-900">{formatDate(selectedTestimoni.approvedAt as string)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </Button>
              {!selectedTestimoni.approved && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleAction(selectedTestimoni, 'reject')}
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleAction(selectedTestimoni, 'approve')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
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
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin{' '}
            <span className="font-semibold text-gray-900">
              {actionType === 'approve' ? 'menyetujui' : 'menolak'}
            </span>{' '}
            testimoni dari <span className="font-semibold text-gray-900">{actionTestimoni?.user?.name || 'Klien'}</span>?
          </p>
          
          {actionType === 'reject' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-medium">Perhatian:</span> Testimoni yang ditolak akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsActionModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              onClick={confirmAction}
              className={
                actionType === 'approve' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
              }
            >
              Ya, {actionType === 'approve' ? 'Approve' : 'Tolak'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}