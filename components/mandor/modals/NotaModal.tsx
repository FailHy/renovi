// FILE: components/mandor/modals/NotaModal.tsx - FIXED UPLOAD INTEGRATION
'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Upload, X, AlertCircle, Calendar, Building2, Tag, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { createNotaWithBahan, updateNota } from '@/lib/actions/mandor/nota'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface NotaModalProps {
  isOpen: boolean
  onClose: () => void
  proyekId: string
  notaData?: any
  milestones?: Array<{
    id: string
    nama: string
    status: string
  }>
}

interface PhotoAlertProps {
  type: 'warning' | 'error' | 'info'
  message: string
  onClose?: () => void
}

function PhotoAlert({ type, message, onClose }: PhotoAlertProps) {
  const bgColor = {
    warning: 'bg-yellow-50 border-yellow-400',
    error: 'bg-red-50 border-red-400',
    info: 'bg-blue-50 border-blue-400'
  }
  
  const textColor = {
    warning: 'text-yellow-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  }
  
  const iconColor = {
    warning: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  }
  
  return (
    <div className={`rounded-md border p-4 mb-3 ${bgColor[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${iconColor[type]}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor[type]}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none ${textColor[type]} hover:opacity-75`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function NotaModal({ 
  isOpen, 
  onClose, 
  proyekId, 
  notaData, 
  milestones = [] 
}: NotaModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadAlert, setUploadAlert] = useState<{type: 'warning' | 'error' | 'info', message: string} | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    namaToko: '',
    tanggalBelanja: new Date().toISOString().split('T')[0],
    fotoNotaUrl: '',
    milestoneId: '',
  })

  // Inisialisasi form data untuk edit mode
  useEffect(() => {
    if (notaData && isOpen) {
      setFormData({
        namaToko: notaData.namaToko || '',
        tanggalBelanja: notaData.tanggalBelanja 
          ? new Date(notaData.tanggalBelanja).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        fotoNotaUrl: notaData.fotoNotaUrl || '',
        milestoneId: notaData.milestoneId || '',
      })
    } else {
      resetForm()
    }
  }, [notaData, isOpen])

  // =============================================
  // FIXED: Upload gambar ke API /api/upload
  // =============================================
  const handleNotaFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validasi ukuran file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      setUploadAlert({
        type: 'error',
        message: `Ukuran file ${formatBytes(file.size)} melebihi batas maksimal 5MB.`
      })
      return
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file JPG, PNG, dan WebP yang diperbolehkan')
      setUploadAlert({
        type: 'error',
        message: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'
      })
      return
    }

    setIsUploading(true)
    setUploadAlert({
      type: 'info',
      message: 'Mengupload foto...'
    })

    try {
      // Buat FormData untuk upload
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)
      
      // Jika mode edit dan ada foto lama, kirim oldFilename untuk dihapus
      if (notaData?.fotoNotaUrl) {
        // Extract filename dari URL (misal: /uploads/artikel-123-abc.jpg -> artikel-123-abc.jpg)
        const oldFilename = notaData.fotoNotaUrl.split('/').pop()
        if (oldFilename) {
          uploadFormData.append('oldFilename', oldFilename)
        }
      }

      // Upload ke API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload gagal')
      }

      const result = await response.json()
      
      // Set URL foto dari response
      setFormData(prev => ({ ...prev, fotoNotaUrl: result.url }))
      
      toast.success('Foto nota berhasil diupload')
      setUploadAlert({
        type: 'info',
        message: `Foto berhasil diupload: ${file.name}`
      })
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload foto')
      setUploadAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat upload'
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Format bytes ke readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.namaToko.trim()) {
      toast.error('Nama toko harus diisi')
      return
    }

    if (!formData.fotoNotaUrl.trim()) {
      toast.error('Foto nota wajib diupload')
      return
    }

    setIsSubmitting(true)

    try {
      // Parse tanggal dengan aman
      const tanggalBelanjaDate = new Date(formData.tanggalBelanja)
      tanggalBelanjaDate.setHours(12, 0, 0, 0)
      
      if (isNaN(tanggalBelanjaDate.getTime())) {
        throw new Error('Tanggal tidak valid')
      }

      if (notaData) {
        // MODE UPDATE
        const updateData = {
          namaToko: formData.namaToko.trim(),
          fotoNotaUrl: formData.fotoNotaUrl,
          tanggalBelanja: tanggalBelanjaDate.toISOString(),
        }

        const result = await updateNota(notaData.id, updateData)

        if (result.success) {
          toast.success('Nota berhasil diperbarui')
          onClose()
          resetForm()
          router.refresh()
        } else {
          toast.error(result.error || 'Gagal memperbarui nota')
        }
      } else {
        // MODE CREATE
        const notaData = {
          proyekId,
          namaToko: formData.namaToko.trim(),
          fotoNotaUrl: formData.fotoNotaUrl,
          tanggalBelanja: tanggalBelanjaDate.toISOString(),
          milestoneId: formData.milestoneId.trim() || undefined,
          bahan_items: []
        }

        const result = await createNotaWithBahan(notaData)

        if (result.success) {
          toast.success('Nota berhasil dibuat')
          onClose()
          resetForm()
          
          // Redirect ke halaman detail nota
          if (result.data?.nota?.id) {
            router.push(`/mandor/proyek/${proyekId}/nota/${result.data.nota.id}`)
          }
        } else {
          toast.error(result.error || 'Gagal membuat nota')
        }
      }
    } catch (error) {
      console.error('Error processing nota:', error)
      toast.error('Terjadi kesalahan: ' + 
        (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      namaToko: '',
      tanggalBelanja: new Date().toISOString().split('T')[0],
      fotoNotaUrl: '',
      milestoneId: '',
    })
    setUploadAlert(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const isEditMode = !!notaData

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Update Nota Belanja" : "Buat Nota Belanja Baru"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alert untuk upload foto */}
        {uploadAlert && (
          <PhotoAlert 
            type={uploadAlert.type}
            message={uploadAlert.message}
            onClose={() => setUploadAlert(null)}
          />
        )}

        {/* Nota Info Section */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-blue-900">
              {isEditMode ? 'Update Informasi Nota' : 'Informasi Nota'}
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Nama Toko */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Toko * <span className="text-red-500">(Wajib)</span>
              </label>
              <Input
                placeholder="Contoh: Toko Bangunan Sumber Jaya"
                value={formData.namaToko}
                onChange={(e) => setFormData({...formData, namaToko: e.target.value})}
                className="bg-white"
                required
                icon={<Building2 className="w-4 h-4" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal Belanja */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Belanja * <span className="text-red-500">(Wajib)</span>
                </label>
                <Input
                  type="date"
                  value={formData.tanggalBelanja}
                  onChange={(e) => setFormData({...formData, tanggalBelanja: e.target.value})}
                  className="bg-white"
                  required
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Milestone Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone (Opsional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.milestoneId}
                    onChange={(e) => setFormData({...formData, milestoneId: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                  >
                    <option value="">Pilih milestone</option>
                    {milestones.length === 0 ? (
                      <option value="" disabled>
                        Tidak ada milestone tersedia
                      </option>
                    ) : (
                      milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                          {milestone.nama} 
                          {milestone.status && ` (${milestone.status})`}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Foto Nota */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Foto Nota * <span className="text-red-500">(Wajib)</span>
                </label>
                {formData.fotoNotaUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, fotoNotaUrl: ''})
                      setUploadAlert(null)
                    }}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Hapus foto
                  </button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleNotaFotoUpload}
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={isUploading}
              />
              
              {!formData.fotoNotaUrl ? (
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`w-full h-48 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center ${
                    isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                  } transition-colors bg-white flex flex-col items-center justify-center`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                      <p className="text-sm text-gray-600">Mengupload foto...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-base font-medium text-gray-700">
                        {isEditMode ? 'Klik untuk ganti foto nota' : 'Klik untuk upload foto nota'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Maks. 5MB)</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative w-full">
                  <img 
                    src={formData.fotoNotaUrl} 
                    alt="Foto nota"
                    className="w-full h-48 object-cover rounded-lg border-2 border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, fotoNotaUrl: ''})
                      setUploadAlert(null)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Foto nota wajib diupload untuk validasi pembelian
              </p>
            </div>
          </div>
        </div>

        {/* Informasi tambahan */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800">Catatan:</p>
              <ul className="mt-1 space-y-1">
                {isEditMode ? (
                  <>
                    <li>• <strong>Foto nota wajib</strong> diupload untuk validasi</li>
                    <li>• Update data nota akan mempengaruhi semua bahan terkait</li>
                    <li>• Milestone bisa diubah untuk re-grouping bahan</li>
                  </>
                ) : (
                  <>
                    <li>• <strong>Foto nota wajib</strong> diupload untuk validasi</li>
                    <li>• Data nota akan disimpan terlebih dahulu</li>
                    <li>• Anda dapat menambahkan bahan setelah nota dibuat</li>
                    <li>• Milestone opsional untuk grouping bahan per tahap</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
            className="min-w-[100px]"
          >
            Batal
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || isUploading || !formData.fotoNotaUrl}
            className={`min-w-[140px] shadow-lg ${
              !formData.fotoNotaUrl
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : isEditMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                {isEditMode ? 'Update Nota' : 'Buat Nota'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}