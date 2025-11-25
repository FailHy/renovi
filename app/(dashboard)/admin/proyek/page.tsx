'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Users, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/TextArea'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProyek, updateProyek, deleteProyek, getAllProyeks, getPelangganOptions, getMandorOptions } from '@/lib/actions/proyek'
import { TIPE_LAYANAN, PROJECT_STATUS } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'

const proyekSchema = z.object({
  nama: z.string().min(1, 'Nama proyek harus diisi'),
  tipeLayanan: z.string().min(1, 'Tipe layanan harus dipilih'),
  pelangganId: z.string().min(1, 'Pelanggan harus dipilih'),
  mandorId: z.string().optional(),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  alamat: z.string().min(1, 'Alamat harus diisi'),
  telpon: z.string().optional(),
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
}

export default function ManajemenProyekPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProyek, setEditingProyek] = useState<Proyek | null>(null)
  const [proyeks, setProyeks] = useState<Proyek[]>([])
  const [pelangganOptions, setPelangganOptions] = useState<any[]>([])
  const [mandorOptions, setMandorOptions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
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
      console.log('🔄 Starting data fetch...')
      
      const [proyeksData, pelangganData, mandorData] = await Promise.all([
        getAllProyeks(),
        getPelangganOptions(),
        getMandorOptions()
      ])
      
      console.log('📦 Proyeks data received:', proyeksData)
      console.log('👥 Pelanggan options received:', pelangganData)
      console.log('👷 Mandor options received:', mandorData)
      
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
      console.log('🏁 Data fetch completed')
    }
  }

  const filteredProyeks = proyeks.filter((proyek) =>
    proyek.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyek.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyek.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        mulai: proyek.mulai,
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Perencanaan': 'warning',
      'Dalam Progress': 'info',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
    }
    return variants[status] || 'info'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Manajemen Proyek"
        description="Kelola semua proyek renovasi dan konstruksi"
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

      {/* Search */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari proyek, pelanggan, atau alamat..."
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Tanggal Mulai</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-2">Memuat data proyek...</p>
                  </td>
                </tr>
              ) : filteredProyeks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-50" />
                      <p className="font-medium">
                        {searchTerm ? 'Tidak ada proyek yang ditemukan' : 'Belum ada proyek'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? 'Coba dengan kata kunci lain' : 'Mulai dengan membuat proyek pertama Anda'}
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
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        {proyek.pelanggan}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {proyek.mandor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-green-600" />
                          </div>
                          {proyek.mandor}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
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
                            className={cn(
                              "h-full transition-all duration-300",
                              proyek.progress >= 80 && "bg-green-500",
                              proyek.progress >= 50 && proyek.progress < 80 && "bg-blue-500",
                              proyek.progress >= 20 && proyek.progress < 50 && "bg-yellow-500",
                              proyek.progress < 20 && "bg-red-500"
                            )}
                            style={{ width: `${proyek.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[35px]">
                          {proyek.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{formatDate(proyek.mulai)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenModal(proyek)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(proyek)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                {...register('alamat')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  error={errors.telpon?.message}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                  {...register('telpon')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  error={errors.mulai?.message}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
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
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Menyimpan...' : editingProyek ? 'Update Proyek' : 'Simpan Proyek'}
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
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