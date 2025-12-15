'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Users, User, Calendar, Briefcase, MapPin, Phone, Home, CheckCircle, Clock, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/TextArea'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProyek, updateProyek, deleteProyek, getAllProyeks, getPelangganOptions, getMandorOptions } from '@/lib/actions/admin/proyek'
import { TIPE_LAYANAN, PROJECT_STATUS } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'
import { HeaderManajemenProyek } from '@/components/dashboard/HeaderDashboard'

// ... (kode schema sama) ...
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
  mandorId: string | null
  mandor: string | null
  status: string
  progress: number
  alamat: string
  deskripsi: string
  telpon: string | null
  mulai: Date
  lastUpdate: Date
}

interface MandorOption {
  value: string
  label: string
}

export default function ManajemenProyekPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProyek, setEditingProyek] = useState<Proyek | null>(null)
  const [proyeks, setProyeks] = useState<Proyek[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pelangganOptions, setPelangganOptions] = useState<any[]>([])
  const [mandorOptions, setMandorOptions] = useState<MandorOption[]>([])
  const [mandorLookup, setMandorLookup] = useState<Map<string, string>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProyek, setDeletingProyek] = useState<Proyek | null>(null)
  const [loading, setLoading] = useState(true)

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProyekFormData>({
    resolver: zodResolver(proyekSchema),
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (mandorOptions.length > 0) {
      const lookup = new Map<string, string>()
      mandorOptions.forEach(mandor => {
        if (mandor.value && mandor.label) {
          lookup.set(mandor.value, mandor.label)
        }
      })
      setMandorLookup(lookup)
    }
  }, [mandorOptions])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [proyeksData, pelangganData, mandorData] = await Promise.all([
        getAllProyeks(),
        getPelangganOptions(),
        getMandorOptions()
      ])
      
      const validProyeks = (proyeksData || []).filter(proyek => 
        proyek && proyek.id && proyek.id.trim() !== ""
      )
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processedProyeks = validProyeks.map((proyek: any) => {
        let mandorNama = proyek.mandor
        if (!mandorNama && mandorData && proyek.mandorId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foundMandor = mandorData.find((m: any) => m.value === proyek.mandorId)
          mandorNama = foundMandor ? foundMandor.label : null
        }
        
        return {
          ...proyek,
          mandorId: proyek.mandorId || null,
          telpon: proyek.telpon || null,
          mandor: mandorNama || null
        }
      })
      
      setProyeks(processedProyeks as Proyek[])
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

  // ... (sisa fungsi handler sama seperti sebelumnya) ...
  // PASTIKAN SEMUA BAGIAN BAWAH TERMASUK RETURN JSX ADA DI SINI
  
  const getMandorName = (mandorId: string | null): string | undefined => {
    if (!mandorId) return undefined
    return mandorLookup.get(mandorId)
  }

  const filteredProyeks = proyeks
    .filter((proyek) => {
      const searchLower = searchTerm.toLowerCase()
      const mandorName = getMandorName(proyek.mandorId)
      
      return (
        proyek.nama.toLowerCase().includes(searchLower) ||
        proyek.pelanggan?.toLowerCase().includes(searchLower) ||
        proyek.alamat.toLowerCase().includes(searchLower) ||
        (mandorName && mandorName.toLowerCase().includes(searchLower))
      )
    })
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
        mulai: new Date(proyek.mulai).toISOString().split('T')[0],
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

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotificationModal({
      isOpen: true,
      type,
      title,
      message
    })
  }

  const closeNotification = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }))
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
        showNotification(
          'success',
          editingProyek ? 'Proyek Berhasil Diupdate' : 'Proyek Berhasil Dibuat',
          editingProyek 
            ? 'Perubahan pada proyek telah berhasil disimpan.'
            : 'Proyek baru telah berhasil ditambahkan ke dalam sistem.'
        )
        await fetchData()
        handleCloseModal()
      } else {
        showNotification(
          'error',
          editingProyek ? 'Gagal Mengupdate Proyek' : 'Gagal Membuat Proyek',
          result.error || `Gagal ${editingProyek ? 'mengupdate' : 'membuat'} proyek`
        )
      }
    } catch (error) {
      console.error('Error:', error)
      showNotification(
        'error',
        'Terjadi Kesalahan',
        'Terjadi kesalahan sistem saat menyimpan data. Silakan coba lagi.'
      )
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
        showNotification(
          'success',
          'Proyek Berhasil Dihapus',
          'Proyek telah berhasil dihapus dari sistem.'
        )
        await fetchData()
      } else {
        showNotification(
          'error',
          'Gagal Menghapus Proyek',
          result.error || 'Gagal menghapus proyek'
        )
      }
      setIsDeleteModalOpen(false)
      setDeletingProyek(null)
    } catch (error) {
      console.error('Error:', error)
      showNotification(
        'error',
        'Terjadi Kesalahan',
        'Terjadi kesalahan sistem saat menghapus data. Silakan coba lagi.'
      )
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Perencanaan': return <AlertCircle className="w-4 h-4 text-blue-600" />
      case 'Dalam Progress': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'Selesai': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Dibatalkan': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
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

  const getStats = () => {
    const total = proyeks.length
    const dalamProgress = proyeks.filter(p => p.status === 'Dalam Progress').length
    const selesai = proyeks.filter(p => p.status === 'Selesai').length
    const perencanaan = proyeks.filter(p => p.status === 'Perencanaan').length
    const dibatalkan = proyeks.filter(p => p.status === 'Dibatalkan').length
    
    return { total, dalamProgress, selesai, perencanaan, dibatalkan }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderManajemenProyek
        action={
          <Button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Proyek</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Home className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dalam Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.dalamProgress}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-3xl font-bold text-green-600">{stats.selesai}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama proyek, klien, mandor, atau alamat..."
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Perencanaan">Perencanaan</option>
              <option value="Dalam Progress">Dalam Progress</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
            
            <div className="text-sm text-gray-600 font-medium flex items-center">
              Menampilkan <span className="mx-1 text-gray-900 font-bold">{filteredProyeks.length}</span> dari <span className="mx-1 text-gray-900 font-bold">{proyeks.length}</span> proyek
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-3 text-gray-600 font-medium">Memuat data proyek...</p>
          </CardContent>
        </Card>
      ) : filteredProyeks.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <Home className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Tidak ada proyek yang ditemukan'
                : 'Belum ada proyek'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Coba ubah filter pencarian atau kata kunci'
                : 'Mulai dengan membuat proyek pertama Anda'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Proyek Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProyeks.map((proyek) => {
            const mandorName = getMandorName(proyek.mandorId) || proyek.mandor
            
            return (
              <Card 
                key={proyek.id} 
                className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative flex-shrink-0">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-xl overflow-hidden p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-blue-700">{proyek.tipeLayanan}</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge 
                      className={cn(
                        "text-xs px-2.5 py-1 font-medium shadow-sm flex items-center gap-1",
                        getStatusColor(proyek.status)
                      )}
                    >
                      {getStatusIcon(proyek.status)}
                      {proyek.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 line-clamp-2 leading-tight">
                    {proyek.nama}
                  </h3>

                  <div className="mb-6">
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

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Klien</p>
                        <p className="font-medium text-gray-900 truncate">{proyek.pelanggan}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Mandor</p>
                        {mandorName ? (
                          <p className="font-medium text-gray-900 truncate">
                            {mandorName}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm">Belum ditugaskan</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Alamat</p>
                        <p className="text-sm text-gray-900 line-clamp-2">{proyek.alamat}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {proyek.deskripsi}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          Mulai: {formatDate(proyek.mulai)}
                        </span>
                      </div>
                      {proyek.telpon && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">{proyek.telpon}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleOpenModal(proyek)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                        title="Edit proyek"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(proyek)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                        title="Hapus proyek"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* MODALS */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProyek ? 'Edit Proyek' : 'Buat Proyek Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Informasi Dasar
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Proyek</label>
                  <Input
                    placeholder="Contoh: Renovasi Rumah Pak Budi"
                    error={errors.nama?.message}
                    {...register('nama')}
                    className="bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Layanan</label>
                  <Select
                    options={TIPE_LAYANAN.map((t) => ({ value: t, label: t }))}
                    error={errors.tipeLayanan?.message}
                    {...register('tipeLayanan')}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Proyek</label>
                  <Select
                    options={Object.values(PROJECT_STATUS).map((s) => ({ value: s, label: s }))}
                    error={errors.status?.message}
                    {...register('status')}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                <Textarea
                  placeholder="Jelaskan detail pekerjaan proyek ini..."
                  rows={3}
                  error={errors.deskripsi?.message}
                  {...register('deskripsi')}
                  className="bg-white resize-none"
                />
              </div>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Personil & Lokasi
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pelanggan</label>
                  <Select
                    options={[{ value: '', label: 'Pilih Pelanggan' }, ...pelangganOptions]}
                    error={errors.pelangganId?.message}
                    {...register('pelangganId')}
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mandor (Opsional)</label>
                  <Select
                    options={[{ value: '', label: 'Pilih Mandor' }, ...mandorOptions]}
                    error={errors.mandorId?.message}
                    {...register('mandorId')}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lokasi</label>
                <Input
                  placeholder="Alamat lengkap lokasi proyek"
                  error={errors.alamat?.message}
                  {...register('alamat')}
                  className="bg-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon (Kontak)</label>
                  <Input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    error={errors.telpon?.message}
                    {...register('telpon')}
                    className="bg-white"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai</label>
                  <Input
                    type="date"
                    error={errors.mulai?.message}
                    {...register('mulai')}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
              className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2"
            >
              {isSubmitting ? 'Menyimpan...' : (editingProyek ? 'Simpan Perubahan' : 'Buat Proyek')}
            </Button>
          </div>
        </form>
      </Modal>

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

      <Modal
        isOpen={notificationModal.isOpen}
        onClose={closeNotification}
        size="md"
        showCloseButton={notificationModal.type === 'success'}
      >
        <div className="text-center py-6 px-4">
          <div className="flex flex-col items-center gap-4">
            {notificationModal.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
            
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                notificationModal.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {notificationModal.title}
              </h3>
              <p className="text-gray-600">
                {notificationModal.message}
              </p>
            </div>
            
            <Button
              onClick={closeNotification}
              className={`mt-4 ${
                notificationModal.type === 'success' 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {notificationModal.type === 'success' ? 'OK' : 'Tutup'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}