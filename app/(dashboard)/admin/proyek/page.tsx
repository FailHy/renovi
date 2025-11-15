'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
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
import { createProyek, updateProyek, deleteProyek } from '@/lib/actions/proyek'
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

// Mock data
const mockPelanggan = [
  { value: '1', label: 'John Doe' },
  { value: '2', label: 'Jane Smith' },
]

const mockMandor = [
  { value: '', label: 'Belum ditentukan' },
  { value: '3', label: 'Ahmad Mandor' },
  { value: '4', label: 'Budi Konstruksi' },
]

const mockProyeks = [
  {
    id: '1',
    nama: 'Renovasi Rumah Pak Budi',
    tipeLayanan: 'Renovasi Rumah',
    pelanggan: 'John Doe',
    mandor: 'Ahmad Mandor',
    status: 'Dalam Progress',
    progress: 45,
    alamat: 'Jl. Sudirman No. 123',
    deskripsi: 'Renovasi total bagian dapur dan kamar mandi',
    telpon: '08123456789',
    mulai: '2024-01-01',
  },
  {
    id: '2',
    nama: 'Pembangunan Kantor',
    tipeLayanan: 'Konstruksi Bangunan',
    pelanggan: 'Jane Smith',
    mandor: 'Budi Konstruksi',
    status: 'Perencanaan',
    progress: 10,
    alamat: 'Jl. Gatot Subroto No. 456',
    deskripsi: 'Pembangunan gedung kantor 3 lantai',
    telpon: '08198765432',
    mulai: '2024-02-15',
  },
]

export default function ManajemenProyekPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProyek, setEditingProyek] = useState<any>(null)
  const [proyeks, setProyeks] = useState(mockProyeks)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProyek, setDeletingProyek] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProyekFormData>({
    resolver: zodResolver(proyekSchema),
  })

  const filteredProyeks = proyeks.filter((proyek) =>
    proyek.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proyek.pelanggan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (proyek?: any) => {
    if (proyek) {
      setEditingProyek(proyek)
      reset({
        nama: proyek.nama,
        tipeLayanan: proyek.tipeLayanan,
        pelangganId: proyek.pelangganId || '1',
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
        mulai: '',
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
      if (editingProyek) {
        console.log('Update proyek:', data)
      } else {
        console.log('Create proyek:', data)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = (proyek: any) => {
    setDeletingProyek(proyek)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      console.log('Delete proyek:', deletingProyek.id)
      setProyeks(proyeks.filter((p) => p.id !== deletingProyek.id))
      setIsDeleteModalOpen(false)
      setDeletingProyek(null)
    } catch (error) {
      console.error('Error:', error)
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Perencanaan': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      'Dalam Progress': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'Selesai': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      'Dibatalkan': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div>
      <DashboardHeader
        title="Manajemen Proyek"
        description="Kelola semua proyek renovasi dan konstruksi"
        action={
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Proyek
          </Button>
        }
      />

      {/* Search */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari proyek atau pelanggan..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Nama Proyek</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Pelanggan</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Mandor</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Tipe Layanan</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Progress</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Tanggal Mulai</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProyeks.map((proyek) => (
                <tr key={proyek.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{proyek.nama}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">{proyek.alamat}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{proyek.pelanggan}</td>
                  <td className="py-3 px-4 text-foreground">{proyek.mandor || '-'}</td>
                  <td className="py-3 px-4 text-foreground">{proyek.tipeLayanan}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={getStatusBadge(proyek.status)}
                        className="text-xs px-2 py-1 bg-opacity-20 border-opacity-50"
                      >
                        {proyek.status}
                      </Badge>
                    </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
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
                      <span className="text-sm font-medium text-foreground min-w-[35px]">
                        {proyek.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{formatDate(proyek.mulai)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                         
                        onClick={() => handleOpenModal(proyek)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                         
                        onClick={() => handleDelete(proyek)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProyeks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Search className="w-8 h-8 opacity-50" />
                <p className="font-medium">
                  {searchTerm ? 'Tidak ada proyek yang ditemukan' : 'Belum ada proyek'}
                </p>
                {!searchTerm && (
                  <Button 
                    variant="outline" 
                      
                    onClick={() => handleOpenModal()}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Proyek Pertama
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProyek ? 'Edit Proyek' : 'Tambah Proyek'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Nama Proyek"
              placeholder="Contoh: Renovasi Rumah Pak Budi"
              error={errors.nama?.message}
              {...register('nama')}
            />

            <Select
              label="Tipe Layanan"
              options={TIPE_LAYANAN.map((t) => ({ value: t, label: t }))}
              error={errors.tipeLayanan?.message}
              {...register('tipeLayanan')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Pelanggan"
                options={mockPelanggan}
                error={errors.pelangganId?.message}
                {...register('pelangganId')}
              />

              <Select
                label="Mandor"
                options={mockMandor}
                error={errors.mandorId?.message}
                {...register('mandorId')}
              />
            </div>

            <Textarea
              label="Deskripsi"
              placeholder="Deskripsikan detail proyek..."
              rows={3}
              error={errors.deskripsi?.message}
              {...register('deskripsi')}
            />

            <Input
              label="Alamat"
              placeholder="Alamat lokasi proyek"
              error={errors.alamat?.message}
              {...register('alamat')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon"
                placeholder="08xxxxxxxxxx"
                error={errors.telpon?.message}
                {...register('telpon')}
              />

              <Input
                label="Tanggal Mulai"
                type="date"
                error={errors.mulai?.message}
                {...register('mulai')}
              />
            </div>

            <Select
              label="Status"
              options={Object.values(PROJECT_STATUS).map((s) => ({ value: s, label: s }))}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
        <p className="mb-6 text-foreground">
          Apakah Anda yakin ingin menghapus proyek{' '}
          <strong>{deletingProyek?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  )
}