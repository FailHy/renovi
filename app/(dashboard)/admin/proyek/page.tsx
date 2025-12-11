'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Users, User, Calendar, MapPin, Phone, FileText, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/TextArea'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProyek, updateProyek, deleteProyek, getAllProyeks, getPelangganOptions, getMandorOptions } from '@/lib/actions/admin/proyek'
import { TIPE_LAYANAN, PROJECT_STATUS } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'

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
  lastUpdate: string
}

export default function ManajemenProyekPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProyek, setEditingProyek] = useState<Proyek | null>(null)
  const [proyeks, setProyeks] = useState<Proyek[]>([])
  const [pelangganOptions, setPelangganOptions] = useState<any[]>([])
  const [mandorOptions, setMandorOptions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProyek, setDeletingProyek] = useState<Proyek | null>(null)
  const [loading, setLoading] = useState(true)

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
      
      const [proyeksData, pelangganData, mandorData] = await Promise.all([
        getAllProyeks(),
        getPelangganOptions(),
        getMandorOptions()
      ])
      
      // Set data proyek
      setProyeks(proyeksData || [])
      
      // Set options
      setPelangganOptions(pelangganData || [])
      setMandorOptions(mandorData || [])
      
    } catch (error) {
      console.error('❌ Error in fetchData:', error)
      setProyeks([])
      setPelangganOptions([])
      setMandorOptions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProyeks = proyeks
    .filter((proyek) =>
      proyek.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyek.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyek.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((proyek) => 
      statusFilter === 'all' || proyek.status === statusFilter
    )
    .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())

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
        alert(editingProyek ? 'Proyek berhasil diupdate' : 'Proyek berhasil dibuat')
        await fetchData()
        handleCloseModal()
      } else {
        alert(result.error || `Gagal ${editingProyek ? 'mengupdate' : 'membuat'} proyek`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat menyimpan data')
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
        alert('Proyek berhasil dihapus')
        await fetchData()
      } else {
        alert(result.error || 'Gagal menghapus proyek')
      }
      setIsDeleteModalOpen(false)
      setDeletingProyek(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Perencanaan': 'bg-blue-50 text-blue-700 border-blue-200',
      'Dalam Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Selesai': 'bg-green-50 text-green-700 border-green-200',
      'Dibatalkan': 'bg-red-50 text-red-700 border-red-200',
    }
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getProgressColor = (progress: number) => {
    if (progress <= 25) return 'bg-red-500'
    if (progress <= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daftar Proyek</h1>
              <p className="text-gray-600 mt-1">
                {proyeks.length} proyek • Terupdate: {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
            <Button 
              onClick={() => handleOpenModal()} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Tambah Proyek
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {/* search box dan filter harus setengah-setengah panjangnya kolomnya dan sejajar baik mode desktop atau mobile*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                
                <div className="relative w-full md:w-100"> 
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari proyek, klien, atau alamat..."
                    className="pl-10 border-gray-300 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select
                options={[
                   //bagian ini disabled aja hanya untuk view awal
                  { value: 'all', label: 'Semua Status' },
                  { value: 'Perencanaan', label: 'Perencanaan' },
                  { value: 'Dalam Progress', label: 'Dalam Progress' },
                  { value: 'Selesai', label: 'Selesai' },
                  { value: 'Dibatalkan', label: 'Dibatalkan' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-gray-300 min-w-[160px] bg-white"
              />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Menampilkan {filteredProyeks.length} dari {proyeks.length} proyek
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Grid - Card Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Memuat data proyek...</p>
          </div>
        ) : filteredProyeks.length === 0 ? (
          <Card className="border border-gray-200 bg-white">
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Search className="w-12 h-12 text-gray-400" />
                <p className="text-gray-700 text-lg">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tidak ada proyek yang ditemukan' 
                    : 'Belum ada proyek'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Coba dengan pencarian atau filter lain'
                    : 'Klik "Tambah Proyek" untuk membuat yang pertama'
                  }
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProyeks.map((proyek) => (
              <Card 
                key={proyek.id} 
                className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-5">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{proyek.nama}</h3>
                          <p className="text-blue-600 font-medium text-sm">{proyek.tipeLayanan}</p>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={cn(
                        "border px-3 py-1 text-xs font-semibold",
                        getStatusColor(proyek.status)
                      )}
                    >
                      {proyek.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className={cn(
                        "text-sm font-bold",
                        proyek.progress <= 25 ? "text-red-600" :
                        proyek.progress <= 70 ? "text-yellow-600" :
                        "text-green-600"
                      )}>
                        {proyek.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          getProgressColor(proyek.progress)
                        )}
                        style={{ width: `${Math.max(proyek.progress, 3)}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-3 mb-5">
                    {/* Klien */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Klien</p>
                        <p className="font-medium text-gray-900 truncate">{proyek.pelanggan}</p>
                      </div>
                    </div>

                    {/* Mandor - DITAMPILKAN DENGAN JELAS */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Mandor</p>
                        {proyek.mandor ? (
                          <p className="font-medium text-gray-900 truncate">{proyek.mandor}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">Belum ditugaskan</p>
                        )}
                      </div>
                    </div>

                    {/* Alamat */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Alamat</p>
                        <p className="text-sm text-gray-900 line-clamp-2">{proyek.alamat}</p>
                      </div>
                    </div>

                    {/* Info Tambahan */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{formatDate(proyek.mulai)}</span>
                      </div>
                      {proyek.telpon && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">{proyek.telpon}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(proyek)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(proyek)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
                className="w-full bg-white"
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
                className="bg-white"
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
                  className="bg-white"
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
                  className="bg-white"
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
                className="bg-white"
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
                className="bg-white"
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
                  title="Masukkan minimal 11 digit"
                  error={errors.telpon?.message}
                  className="bg-white"
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
                  className="bg-white"
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
                className="bg-white"
                {...register('status')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
              className="border-gray-300"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Menyimpan...' : editingProyek ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus proyek{' '}
            <strong className="text-red-600">{deletingProyek?.nama}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-gray-300"
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}