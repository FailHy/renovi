'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Users, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/TextArea'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { HeaderManajemenProyek } from '@/components/dashboard/HeaderDashboard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProyek, updateProyek, deleteProyek, getAllProyeks, getPelangganOptions, getMandorOptions } from '@/lib/actions/admin/proyek'
import { verifyProjectCompletion, getProjectsPendingVerification } from './ProyekVerif'
import { TIPE_LAYANAN, PROJECT_STATUS } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const proyekSchema = z.object({
  nama: z.string().min(1, 'Nama proyek harus diisi'),
  tipeLayanan: z.string().min(1, 'Tipe layanan harus dipilih'),
  pelangganId: z.string().min(1, 'Pelanggan harus dipilih'),
  mandorId: z.string().optional(),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  alamat: z.string().min(1, 'Alamat harus diisi'),
  telpon: z.string().optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'Nomor telepon hanya boleh berisi angka',
    })
    .refine((val) => !val || val.length >= 11, {
      message: 'Nomor telepon minimal 11 digit',
    })
    .refine((val) => !val || val.length <= 15, {
      message: 'Nomor telepon maksimal 15 digit',
    }),
  mulai: z.string().min(1, 'Tanggal mulai harus diisi'),
  status: z.string().min(1, 'Status harus dipilih'),
})

type ProyekFormData = z.infer<typeof proyekSchema>

interface Proyek {
  id: string
  nama: string
  tipeLayanan: string
  pelangganId: string
  pelanggan: string
  mandorId?: string
  mandor?: string
  status: string
  progress: number
  alamat: string
  deskripsi: string
  telpon?: string
  mulai: string
  selesai?: string
  isVerifiedComplete: boolean
  verifiedAt?: string
  verifiedBy?: string
  verificationNote?: string
}

export default function ManajemenProyekPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProyek, setEditingProyek] = useState<Proyek | null>(null)
  const [proyeks, setProyeks] = useState<Proyek[]>([])
  const [pendingVerification, setPendingVerification] = useState<Proyek[]>([])
  const [pelangganOptions, setPelangganOptions] = useState<any[]>([])
  const [mandorOptions, setMandorOptions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProyek, setDeletingProyek] = useState<Proyek | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pendingVerification: 0,
    verified: 0,
    inProgress: 0
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProyekFormData>({
    resolver: zodResolver(proyekSchema),
  })

  // Fetch data proyek dan options
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [proyeksData, pelangganData, mandorData, pendingData] = await Promise.all([
        getAllProyeks(),
        getPelangganOptions(),
        getMandorOptions(),
        getProjectsPendingVerification()
      ])
      
      // Set data proyek
      setProyeks(proyeksData || [])
      setPendingVerification(pendingData.success ? pendingData.data || [] : [])
      
      // Set options
      setPelangganOptions(pelangganData || [])
      setMandorOptions(mandorData || [])
      
      // Calculate stats
      const verifiedCount = proyeksData.filter((p: Proyek) => p.isVerifiedComplete).length
      const pendingCount = pendingData.success ? pendingData.data?.length || 0 : 0
      const inProgressCount = proyeksData.filter((p: Proyek) => p.status === 'Dalam Progress').length
      
      setStats({
        total: proyeksData.length || 0,
        pendingVerification: pendingCount,
        verified: verifiedCount,
        inProgress: inProgressCount
      })
      
    } catch (error) {
      console.error('❌ Error in fetchData:', error)
      setProyeks([])
      setPelangganOptions([])
      setMandorOptions([])
      setPendingVerification([])
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyProject = async (proyek: Proyek, isVerified: boolean) => {
    try {
      const note = isVerified ? prompt('Masukkan catatan verifikasi (opsional):') : undefined
      
      const result = await verifyProjectCompletion(proyek.id, isVerified, note || undefined)
      
      if (result.success) {
        toast.success(result.message)
        await fetchData()
      } else {
        toast.error(result.error || 'Gagal verifikasi proyek')
      }
    } catch (error) {
      console.error('Error verifying project:', error)
      toast.error('Terjadi kesalahan saat verifikasi')
    }
  }

  const filteredProyeks = proyeks.filter((proyek) => {
    // Search filter
    const matchSearch = 
      proyek.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyek.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyek.alamat.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchStatus = statusFilter === 'all' || proyek.status === statusFilter

    // Verification filter
    const matchVerification = verificationFilter === 'all' ||
      (verificationFilter === 'verified' && proyek.isVerifiedComplete) ||
      (verificationFilter === 'pending' && !proyek.isVerifiedComplete && proyek.progress === 100 && proyek.status === 'Selesai') ||
      (verificationFilter === 'unverified' && !proyek.isVerifiedComplete)

    return matchSearch && matchStatus && matchVerification
  })

  const handleOpenModal = (proyek?: Proyek) => {
    if (proyek) {
      setEditingProyek(proyek)
      reset({
        nama: proyek.nama,
        tipeLayanan: proyek.tipeLayanan,
        pelangganId: proyek.pelangganId,
        mandorId: proyek.mandorId || '',
        deskripsi: proyek.deskripsi,
        alamat: proyek.alamat,
        telpon: proyek.telpon || '',
        mulai: proyek.mulai.split('T')[0],
        status: proyek.status,
      })
    } else {
      setEditingProyek(null)
      reset({
        nama: '',
        tipeLayanan: '',
        pelangganId: '',
        mandorId: '',
        deskripsi: '',
        alamat: '',
        telpon: '',
        mulai: new Date().toISOString().split('T')[0],
        status: 'Perencanaan',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProyek(null)
    reset()
  }

  const onSubmit = async (data: ProyekFormData) => {
    try {
      let result
      if (editingProyek) {
        result = await updateProyek(editingProyek.id, data)
      } else {
        result = await createProyek(data)
      }
      
      if (result.success) {
        toast.success(editingProyek ? 'Proyek berhasil diupdate' : 'Proyek berhasil dibuat')
        await fetchData()
        handleCloseModal()
      } else {
        toast.error(result.error || `Gagal ${editingProyek ? 'mengupdate' : 'membuat'} proyek`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat menyimpan data')
    }
  }

  const handleDelete = (proyek: Proyek) => {
    setDeletingProyek(proyek)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingProyek) return

    try {
      const result = await deleteProyek(deletingProyek.id)
      if (result.success) {
        toast.success('Proyek berhasil dihapus')
        await fetchData()
      } else {
        toast.error(result.error || 'Gagal menghapus proyek')
      }
      setIsDeleteModalOpen(false)
      setDeletingProyek(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat menghapus data')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Perencanaan': 'warning',
      'Dalam Progress': 'info',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
    }
    return variants[status] || 'info'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* bagian proyek */}
      <HeaderManajemenProyek 
        action={
          <Button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Proyek</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dalam Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-yellow-200 shadow-sm bg-yellow-50">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Butuh Verifikasi</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingVerification}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-700" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-green-200 shadow-sm bg-green-50">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Terverifikasi</p>
                <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Verification Alert */}
      {pendingVerification.length > 0 && (
        <Card className="mb-6 border border-yellow-200 bg-yellow-50 shadow-sm">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    {pendingVerification.length} Proyek Menunggu Verifikasi
                  </h3>
                  <Badge variant="warning" className="text-xs">
                    PENTING
                  </Badge>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Proyek-proyek berikut sudah 100% selesai dan menunggu verifikasi dari admin.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingVerification.slice(0, 3).map(proyek => (
                    <button
                      key={proyek.id}
                      onClick={() => {
                        const note = prompt(`Verifikasi proyek "${proyek.nama}"\nMasukkan catatan (opsional):`)
                        if (note !== null) {
                          handleVerifyProject(proyek, true)
                        }
                      }}
                      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-medium transition-colors"
                    >
                      {proyek.nama}
                    </button>
                  ))}
                  {pendingVerification.length > 3 && (
                    <span className="text-xs text-yellow-600">
                      +{pendingVerification.length - 3} lainnya
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="bg-white absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari proyek, pelanggan, atau alamat..."
                className="bg-white pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'Perencanaan', label: 'Perencanaan' },
                { value: 'Dalam Progress', label: 'Dalam Progress' },
                { value: 'Selesai', label: 'Selesai' },
                { value: 'Dibatalkan', label: 'Dibatalkan' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />

            {/* Verification Filter */}
            <Select
              options={[
                { value: 'all', label: 'Semua Verifikasi' },
                { value: 'verified', label: 'Terverifikasi' },
                { value: 'pending', label: 'Butuh Verifikasi' },
                { value: 'unverified', label: 'Belum Diverifikasi' },
              ]}
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Menampilkan {filteredProyeks.length} dari {proyeks.length} proyek
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Nama Proyek</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Pelanggan</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Mandor</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Tipe Layanan</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Verifikasi</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="font-medium">Memuat data proyek...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProyeks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-10 h-10 opacity-50" />
                      <p className="font-medium">
                        {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all' 
                          ? 'Tidak ada proyek yang ditemukan' 
                          : 'Belum ada proyek'
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                          ? 'Coba dengan filter atau kata kunci lain'
                          : 'Mulai dengan membuat proyek pertama Anda'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProyeks.map((proyek) => (
                  <tr key={proyek.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{proyek.nama}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{proyek.alamat}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Mulai: {formatDate(proyek.mulai)}
                          {proyek.selesai && ` • Selesai: ${formatDate(proyek.selesai)}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-gray-900">{proyek.pelanggan}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {proyek.mandor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-900">{proyek.mandor}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{proyek.tipeLayanan}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={getStatusBadge(proyek.status)}
                        className="text-xs px-2 py-1 font-medium"
                      >
                        {proyek.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getProgressColor(proyek.progress)}`}
                            style={{ width: `${proyek.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[35px]">
                          {proyek.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {proyek.progress === 100 && proyek.status === 'Selesai' ? (
                        proyek.isVerifiedComplete ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="success" className="text-xs px-2 py-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Terverifikasi
                            </Badge>
                            <button
                              onClick={() => handleVerifyProject(proyek, false)}
                              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                              title="Batalkan verifikasi"
                            >
                              Batalkan
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const note = prompt(`Verifikasi proyek "${proyek.nama}"\nMasukkan catatan (opsional):`)
                              if (note !== null) {
                                handleVerifyProject(proyek, true)
                              }
                            }}
                            className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Verifikasi
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Belum selesai</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenModal(proyek)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                          title="Edit proyek"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(proyek)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Hapus proyek"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProyek ? 'Edit Proyek' : 'Tambah Proyek'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Proyek
              </label>
              <Input
                placeholder="Contoh: Renovasi Rumah Pak Budi"
                error={errors.nama?.message}
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register('nama')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Layanan
              </label>
              <Select
                options={TIPE_LAYANAN.map((t) => ({ value: t, label: t }))}
                error={errors.tipeLayanan?.message}
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register('tipeLayanan')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pelanggan
                </label>
                <Select
                  options={pelangganOptions}
                  error={errors.pelangganId?.message}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('pelangganId')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mandor
                </label>
                <Select
                  options={mandorOptions}
                  error={errors.mandorId?.message}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('mandorId')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <Textarea
                placeholder="Deskripsikan detail proyek..."
                rows={3}
                error={errors.deskripsi?.message}
                className="bg-white  border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register('deskripsi')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <Input
                placeholder="Alamat lokasi proyek"
                error={errors.alamat?.message}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register('alamat')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <Input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  title='masukkan minimal 11 digit'
                  error={errors.telpon?.message}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('telpon')}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  error={errors.mulai?.message}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('mulai')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                options={Object.values(PROJECT_STATUS).map((s) => ({ value: s, label: s }))}
                error={errors.status?.message}
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                {...register('status')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </span>
              ) : editingProyek ? 'Update Proyek' : 'Simpan Proyek'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Hapus Proyek</p>
              <p className="text-sm text-gray-600">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus proyek{' '}
            <strong className="text-red-600">{deletingProyek?.nama}</strong>? 
            Semua data terkait (milestone, nota, bahan) juga akan dihapus.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}