// FILE: components/mandor/BahanForm.tsx - FIXED UPLOAD INTEGRATION
'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Plus, Trash2, Edit2, Save, X, Upload, 
  DollarSign, Loader2
} from 'lucide-react'
import { 
  createBahanItem, 
  updateBahanItem, 
  deleteBahan
} from '@/lib/actions/mandor/bahan'
import toast from 'react-hot-toast'
import { DeleteConfirmModal } from './modals/DeleteModal'

interface BahanFormSectionProps {
  notaId: string
  proyekId: string
  existingBahan?: any[]
  milestones?: Array<{ id: string; nama: string }>
  onBahanUpdated: () => void
}

const SATUAN_OPTIONS = [
  'pcs', 'kg', 'gram', 'meter', 'cm', 'm2', 'm3', 
  'liter', 'ml', 'sak', 'buah', 'box', 'karung', 'roll', 'lembar'
]

const STATUS_OPTIONS = ['Digunakan', 'Sisa', 'Rusak'] as const

const KATEGORI_OPTIONS = [
  'Material Bangunan',
  'Alat Kerja',
  'Cat & Finishing',
  'Listrik & Pipa',
  'Furniture',
  'Lainnya'
]

interface BahanFormData {
  nama: string
  deskripsi: string
  harga: string
  kuantitas: string
  satuan: string
  kategori: string
  milestoneId: string
  gambar: string[]
}

interface EditFormData {
  nama: string
  deskripsi: string
  harga: string
  kuantitas: string
  satuan: string
  kategori: string
  status: string
  gambar: string[]
}

export function BahanFormSection({ 
  notaId, 
  proyekId, 
  existingBahan, 
  milestones = [],
  onBahanUpdated 
}: BahanFormSectionProps) {
  const [bahanList, setBahanList] = useState<any[]>([])
  
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newBahan, setNewBahan] = useState<BahanFormData>({
    nama: '',
    deskripsi: '',
    harga: '',
    kuantitas: '',
    satuan: 'pcs',
    kategori: '',
    milestoneId: '',
    gambar: []
  })

  const [editingBahanId, setEditingBahanId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nama: '',
    deskripsi: '',
    harga: '',
    kuantitas: '',
    satuan: 'pcs',
    kategori: '',
    status: 'Digunakan',
    gambar: []
  })

  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [bahanToDelete, setBahanToDelete] = useState<{ id: string; nama: string } | null>(null)

  useEffect(() => {
    if (Array.isArray(existingBahan)) {
      setBahanList(existingBahan)
    } else {
      setBahanList([])
    }
  }, [existingBahan])

  // ========================================
  // FIXED: FUNGSI UPLOAD GAMBAR KE API
  // ========================================
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    isEdit = false, 
    bahanId?: string
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validasi file
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} terlalu besar (max 5MB)`)
        }

        // Buat FormData untuk upload
        const formData = new FormData()
        formData.append('image', file)

        // Upload ke API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload gagal')
        }

        const result = await response.json()
        return result.url // Return URL dari server
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      if (isEdit && bahanId) {
        setEditFormData(prev => ({
          ...prev,
          gambar: [...(prev.gambar || []), ...uploadedUrls]
        }))
      } else {
        setNewBahan(prev => ({
          ...prev,
          gambar: [...prev.gambar, ...uploadedUrls]
        }))
      }

      toast.success(`${uploadedUrls.length} gambar berhasil ditambahkan`)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload gambar')
    } finally {
      setUploadingImage(false)
      // Reset input file
      e.target.value = ''
    }
  }

  const removeImage = async (index: number, isEdit = false, imageUrl?: string) => {
    // Jika gambar sudah terupload, hapus dari server
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      try {
        const filename = imageUrl.split('/').pop()
        if (filename) {
          // Call delete endpoint (optional - bisa dibuat nanti)
          // await fetch(`/api/upload/${filename}`, { method: 'DELETE' })
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        gambar: prev.gambar.filter((_, i) => i !== index)
      }))
    } else {
      setNewBahan(prev => ({
        ...prev,
        gambar: prev.gambar.filter((_, i) => i !== index)
      }))
    }
  }

  // ========================================
  // FUNGSI CREATE BAHAN BARU
  // ========================================
  const handleAddBahan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBahan.nama.trim()) {
      toast.error('Nama bahan wajib diisi')
      return
    }
    
    const harga = parseFloat(newBahan.harga)
    const kuantitas = parseFloat(newBahan.kuantitas)
    
    if (isNaN(harga) || harga <= 0) {
      toast.error('Harga harus lebih dari 0')
      return
    }
    
    if (isNaN(kuantitas) || kuantitas <= 0) {
      toast.error('Kuantitas harus lebih dari 0')
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Menambahkan bahan...')

    try {
      const result = await createBahanItem({
        notaId,
        proyekId,
        nama: newBahan.nama,
        deskripsi: newBahan.deskripsi,
        harga,
        kuantitas,
        satuan: newBahan.satuan,
        kategori: newBahan.kategori || undefined,
        gambar: newBahan.gambar.length > 0 ? newBahan.gambar : undefined,
        milestoneId: newBahan.milestoneId || undefined
      })

      if (result.success) {
        toast.success(result.message || 'Bahan berhasil ditambahkan!', { id: toastId })
        resetNewBahanForm()
        onBahanUpdated()
      } else {
        toast.error(result.error || 'Gagal menambahkan bahan', { id: toastId })
      }
    } catch (error) {
      console.error('Error adding bahan:', error)
      toast.error('Terjadi kesalahan', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const resetNewBahanForm = () => {
    setNewBahan({
      nama: '',
      deskripsi: '',
      harga: '',
      kuantitas: '',
      satuan: 'pcs',
      kategori: '',
      milestoneId: '',
      gambar: []
    })
    setIsAddingNew(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ========================================
  // FUNGSI UPDATE BAHAN
  // ========================================
  const startEdit = (bahan: any) => {
    setEditingBahanId(bahan.id)
    setEditFormData({
      nama: bahan.nama,
      deskripsi: bahan.deskripsi || '',
      harga: typeof bahan.harga === 'number' ? bahan.harga.toString() : bahan.harga || '',
      kuantitas: typeof bahan.kuantitas === 'number' ? bahan.kuantitas.toString() : bahan.kuantitas || '',
      satuan: bahan.satuan || 'pcs',
      kategori: bahan.kategori || '',
      status: bahan.status || 'Digunakan',
      gambar: Array.isArray(bahan.gambar) ? bahan.gambar : []
    })
  }

  const cancelEdit = () => {
    setEditingBahanId(null)
    setEditFormData({
      nama: '',
      deskripsi: '',
      harga: '',
      kuantitas: '',
      satuan: 'pcs',
      kategori: '',
      status: 'Digunakan',
      gambar: []
    })
  }

  const handleUpdateBahan = async (bahanId: string) => {
    if (!editFormData.nama?.trim()) {
      toast.error('Nama bahan wajib diisi')
      return
    }

    const harga = parseFloat(editFormData.harga)
    const kuantitas = parseFloat(editFormData.kuantitas)
    
    if (isNaN(harga) || harga <= 0) {
      toast.error('Harga harus lebih dari 0')
      return
    }
    
    if (isNaN(kuantitas) || kuantitas <= 0) {
      toast.error('Kuantitas harus lebih dari 0')
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Mengupdate bahan...')

    try {
      const result = await updateBahanItem(bahanId, {
        nama: editFormData.nama,
        deskripsi: editFormData.deskripsi,
        harga,
        kuantitas,
        satuan: editFormData.satuan,
        kategori: editFormData.kategori || undefined,
        status: editFormData.status,
        gambar: editFormData.gambar
      })

      if (result.success) {
        toast.success(result.message || 'Bahan berhasil diupdate!', { id: toastId })
        cancelEdit()
        onBahanUpdated()
      } else {
        toast.error(result.error || 'Gagal mengupdate bahan', { id: toastId })
      }
    } catch (error) {
      console.error('Error updating bahan:', error)
      toast.error('Terjadi kesalahan', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  // ========================================
  // FUNGSI DELETE BAHAN (DENGAN MODAL)
  // ========================================
  const openDeleteModal = (bahan: { id: string; nama: string }) => {
    setBahanToDelete(bahan)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setBahanToDelete(null)
    setDeletingId(null)
  }

  const handleDeleteBahan = async () => {
    if (!bahanToDelete) return

    setDeletingId(bahanToDelete.id)
    
    try {
      const result = await deleteBahan(bahanToDelete.id)
      
      if (result.success) {
        toast.success(result.message || 'Bahan berhasil dihapus!')
        closeDeleteModal()
        onBahanUpdated()
      } else {
        toast.error(result.error || 'Gagal menghapus bahan')
        closeDeleteModal()
      }
    } catch (error) {
      console.error('Error deleting bahan:', error)
      toast.error('Terjadi kesalahan saat menghapus bahan')
      closeDeleteModal()
    } finally {
      setDeletingId(null)
    }
  }

  const bahanCount = bahanList.length

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Kelola Bahan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tambah, edit, atau hapus item bahan dalam nota ini
          </p>
        </div>
        
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Bahan
          </button>
        )}
      </div>

      {/* Form Tambah Bahan Baru */}
      {isAddingNew && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Tambah Bahan Baru
            </h3>
            <button
              onClick={resetNewBahanForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddBahan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Bahan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Bahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBahan.nama}
                  onChange={(e) => setNewBahan(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Semen Portland"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={newBahan.kategori}
                  onChange={(e) => setNewBahan(prev => ({ ...prev, kategori: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih kategori</option>
                  {KATEGORI_OPTIONS.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Satuan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBahan.harga}
                    onChange={(e) => setNewBahan(prev => ({ ...prev, harga: e.target.value }))}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Kuantitas & Satuan */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kuantitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBahan.kuantitas}
                    onChange={(e) => setNewBahan(prev => ({ ...prev, kuantitas: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan
                  </label>
                  <select
                    value={newBahan.satuan}
                    onChange={(e) => setNewBahan(prev => ({ ...prev, satuan: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SATUAN_OPTIONS.map(sat => (
                      <option key={sat} value={sat}>{sat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Milestone */}
              {milestones.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Milestone
                  </label>
                  <select
                    value={newBahan.milestoneId}
                    onChange={(e) => setNewBahan(prev => ({ ...prev, milestoneId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tidak ada milestone</option>
                    {milestones.map(ms => (
                      <option key={ms.id} value={ms.id}>{ms.nama}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi / Catatan
              </label>
              <textarea
                value={newBahan.deskripsi}
                onChange={(e) => setNewBahan(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Tambahkan catatan atau deskripsi..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Bahan (Opsional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Upload Gambar</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                {uploadingImage && (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>

              {/* Preview Gambar */}
              {newBahan.gambar.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {newBahan.gambar.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx, false, img)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetNewBahanForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Bahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Bahan Existing */}
      {bahanList.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Daftar Bahan ({bahanCount})</h3>
          
          {bahanList.map((bahan) => {
            const isEditing = editingBahanId === bahan.id
            const harga = Number(bahan.harga) || 0
            const kuantitas = Number(bahan.kuantitas) || 0
            const subtotal = harga * kuantitas

            return (
              <div
                key={bahan.id}
                className={`border rounded-xl p-5 transition-all ${
                  isEditing 
                    ? 'bg-yellow-50 border-yellow-300 border-2' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {isEditing ? (
                  /* EDIT MODE */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-yellow-600" />
                        Edit Bahan
                      </h4>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nama Bahan */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Bahan
                        </label>
                        <input
                          type="text"
                          value={editFormData.nama}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, nama: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>

                      {/* Kategori */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategori
                        </label>
                        <select
                          value={editFormData.kategori}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, kategori: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        >
                          <option value="">Pilih kategori</option>
                          {KATEGORI_OPTIONS.map(kat => (
                            <option key={kat} value={kat}>{kat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Harga */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga Satuan
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editFormData.harga}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, harga: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>

                      {/* Kuantitas & Satuan */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kuantitas
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editFormData.kuantitas}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, kuantitas: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Satuan
                          </label>
                          <select
                            value={editFormData.satuan}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, satuan: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          >
                            {SATUAN_OPTIONS.map(sat => (
                              <option key={sat} value={sat}>{sat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        >
                          {STATUS_OPTIONS.map(stat => (
                            <option key={stat} value={stat}>{stat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        value={editFormData.deskripsi}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 resize-none"
                      />
                    </div>

                    {/* Upload gambar untuk edit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Bahan
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Upload Gambar</span>
                          <input
                            ref={(el) => (editFileInputRefs.current[bahan.id] = el)}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(e, true, bahan.id)}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                        {uploadingImage && (
                          <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                        )}
                      </div>

                      {/* Preview gambar edit */}
                      {editFormData.gambar.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {editFormData.gambar.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`Bahan ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx, true, img)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={cancelEdit}
                        className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                        disabled={submitting}
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleUpdateBahan(bahan.id)}
                        disabled={submitting}
                        className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <div className="space-y-3">
                    {/* Row title, category & status */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {bahan.nama}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {bahan.kategori || 'Tanpa kategori'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bahan.status === 'Rusak'
                            ? 'bg-red-100 text-red-700'
                            : bahan.status === 'Sisa'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {bahan.status || 'Digunakan'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-sm text-gray-700">
                      {kuantitas} {bahan.satuan} × Rp {harga.toLocaleString('id-ID')}
                    </div>
                    <div className="font-semibold text-gray-900">
                      Subtotal: Rp {subtotal.toLocaleString('id-ID')}
                    </div>

                    {bahan.deskripsi && (
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {bahan.deskripsi}
                      </p>
                    )}

                    {/* Images preview */}
                    {Array.isArray(bahan.gambar) && bahan.gambar.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {bahan.gambar.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Bahan ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        onClick={() => startEdit(bahan)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal({ id: bahan.id, nama: bahan.nama })}
                        disabled={deletingId === bahan.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingId === bahan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Belum ada bahan yang ditambahkan</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        itemName={bahanToDelete?.nama}
        itemType="bahan"
        onConfirm={handleDeleteBahan}
        isLoading={deletingId === bahanToDelete?.id}
      />
    </div>
  )
}