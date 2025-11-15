'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate } from '@/lib/utils'

const artikelSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  konten: z.string().min(50, 'Konten minimal 50 karakter'),
  kategori: z.string().optional(),
  gambar: z.string().optional(),
  published: z.boolean(),
})

type ArtikelFormData = z.infer<typeof artikelSchema>

// Mock data
const mockArtikels = [
  {
    id: '1',
    judul: 'Tips Memilih Kontraktor Renovasi yang Tepat',
    konten: 'Memilih kontraktor renovasi yang tepat adalah langkah penting untuk memastikan proyek Anda berjalan lancar. Berikut beberapa tips yang bisa Anda terapkan...',
    kategori: 'Tips Renovasi',
    gambar: '/images/articles/artikel-1.jpg',
    published: true,
    posting: '2024-03-15',
    author: { nama: 'Administrator Renovi' },
  },
  {
    id: '2',
    judul: 'Tren Desain Interior 2024: Minimalis Modern',
    konten: 'Desain interior minimalis modern terus menjadi tren di tahun 2024. Konsep ini mengedepankan kesederhanaan, fungsionalitas, dan estetika yang bersih...',
    kategori: 'Inspirasi Desain',
    gambar: '/images/articles/artikel-2.jpg',
    published: true,
    posting: '2024-03-10',
    author: { nama: 'Administrator Renovi' },
  },
  {
    id: '3',
    judul: 'Panduan Lengkap Renovasi Dapur: Budget hingga Eksekusi',
    konten: 'Renovasi dapur adalah investasi yang akan meningkatkan kenyamanan dan nilai rumah Anda. Berikut panduan lengkapnya...',
    kategori: 'Tips Renovasi',
    gambar: '/images/articles/artikel-3.jpg',
    published: false,
    posting: '2024-03-05',
    author: { nama: 'Administrator Renovi' },
  },
]

const kategoriOptions = [
  'Tips Renovasi',
  'Inspirasi Desain',
  'Tutorial',
  'Berita',
  'Studi Kasus',
]

export default function ManajemenArtikelPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtikel, setEditingArtikel] = useState<any>(null)
  const [artikels, setArtikels] = useState(mockArtikels)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterPublished, setFilterPublished] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingArtikel, setDeletingArtikel] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArtikelFormData>({
    resolver: zodResolver(artikelSchema),
  })

  const filteredArtikels = artikels.filter((artikel) => {
    const matchSearch =
      artikel.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artikel.konten.toLowerCase().includes(searchTerm.toLowerCase())

    const matchKategori = filterKategori
      ? artikel.kategori === filterKategori
      : true

    const matchPublished =
      filterPublished === ''
        ? true
        : filterPublished === 'published'
        ? artikel.published
        : !artikel.published

    return matchSearch && matchKategori && matchPublished
  })

  const handleOpenModal = (artikel?: any) => {
    if (artikel) {
      setEditingArtikel(artikel)
      reset({
        judul: artikel.judul,
        konten: artikel.konten,
        kategori: artikel.kategori || '',
        gambar: artikel.gambar || '',
        published: artikel.published,
      })
    } else {
      setEditingArtikel(null)
      reset({
        judul: '',
        konten: '',
        kategori: '',
        gambar: '',
        published: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingArtikel(null)
    reset()
  }

  const onSubmit = async (data: ArtikelFormData) => {
    try {
      if (editingArtikel) {
        console.log('Update artikel:', data)
        alert('Artikel berhasil diupdate!')
      } else {
        console.log('Create artikel:', data)
        alert('Artikel berhasil ditambahkan!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan!')
    }
  }

  const handleDelete = (artikel: any) => {
    setDeletingArtikel(artikel)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      console.log('Delete artikel:', deletingArtikel.id)
      setArtikels(artikels.filter((a) => a.id !== deletingArtikel.id))
      alert('Artikel berhasil dihapus!')
      setIsDeleteModalOpen(false)
      setDeletingArtikel(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan!')
    }
  }

  const getStats = () => {
    const published = artikels.filter((a) => a.published).length
    const draft = artikels.filter((a) => !a.published).length
    return { published, draft }
  }

  const stats = getStats()

  return (
    <div>
      <DashboardHeader
        title="Manajemen Artikel"
        description="Kelola artikel dan konten blog Renovi"
        action={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Artikel
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Total Artikel
                </p>
                <p className="text-3xl font-bold">{artikels.length}</p>
              </div>
              <Newspaper className="w-12 h-12 text-light-primary dark:text-dark-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Published
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.published}
                </p>
              </div>
              <Eye className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Draft
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.draft}
                </p>
              </div>
              <EyeOff className="w-12 h-12 text-yellow-600 opacity-20" />
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
                placeholder="Cari judul atau konten..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Articles Grid */}
      {filteredArtikels.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {searchTerm || filterKategori || filterPublished
                ? 'Tidak ada artikel yang ditemukan'
                : 'Belum ada artikel'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtikels.map((artikel) => (
            <Card key={artikel.id} hover>
              <div className="relative">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
                  {artikel.gambar ? (
                    <img
                      src={artikel.gambar}
                      alt={artikel.judul}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant={artikel.published ? 'success' : 'warning'}>
                    {artikel.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {artikel.kategori && (
                  <Badge variant="info" className="mb-2">
                    {artikel.kategori}
                  </Badge>
                )}

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {artikel.judul}
                </h3>

                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-3">
                  {artikel.konten}
                </p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    {artikel.author.nama}
                  </span>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">
                    {formatDate(artikel.posting)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenModal(artikel)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(artikel)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingArtikel ? 'Edit Artikel' : 'Tambah Artikel'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Judul Artikel"
            placeholder="Contoh: Tips Memilih Kontraktor Terbaik"
            error={errors.judul?.message}
            {...register('judul')}
          />

          <Select
            label="Kategori"
            options={kategoriOptions.map((k) => ({ value: k, label: k }))}
            error={errors.kategori?.message}
            {...register('kategori')}
          />

          <Input
            label="URL Gambar"
            placeholder="/images/artikel.jpg"
            error={errors.gambar?.message}
            {...register('gambar')}
          />

          <Textarea
            label="Konten Artikel"
            placeholder="Tulis konten artikel di sini..."
            rows={10}
            error={errors.konten?.message}
            {...register('konten')}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              className="w-4 h-4"
              {...register('published')}
            />
            <label htmlFor="published" className="text-sm">
              Publikasikan artikel sekarang
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Menyimpan...'
                : editingArtikel
                ? 'Update'
                : 'Simpan'}
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
        <p className="mb-6">
          Apakah Anda yakin ingin menghapus artikel{' '}
          <strong>{deletingArtikel?.judul}</strong>? Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
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