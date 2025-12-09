// FILE: components/mandor/modals/NotaModal.tsx - WITH ALERTS AND OPTIMIZATION
'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Plus, Trash2, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { createNotaWithBahan } from '@/lib/actions/mandor/nota'
import { toast } from 'react-hot-toast'

interface NotaModalProps {
  isOpen: boolean
  onClose: () => void
  proyekId: string
}

interface BahanItem {
  nama: string
  deskripsi?: string
  harga: number
  kuantitas: number
  satuan: string
  kategori?: string
  gambar?: string[] // Array gambar untuk setiap bahan
}

// Fungsi untuk mengompresi gambar
const compressImage = (base64String: string, maxWidth = 1024, maxHeight = 1024, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = base64String
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      // Hitung ukuran baru yang sesuai dengan batas maksimal
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not found'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // Konversi ke JPEG dengan kualitas tertentu untuk mengurangi ukuran
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }
    
    img.onerror = () => reject(new Error('Gagal memuat gambar'))
  })
}

// Komponen Alert untuk foto upload
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
          <div className="mt-2 text-sm">
            <p className={`${textColor[type]} opacity-90`}>
              Tips: Gunakan gambar dengan ukuran <strong>maksimal 2MB</strong> dan format <strong>JPG/JPEG</strong> untuk hasil terbaik.
            </p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor[type]} hover:opacity-75`}
              >
                <span className="sr-only">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function NotaModal({ isOpen, onClose, proyekId }: NotaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadAlert, setUploadAlert] = useState<{type: 'warning' | 'error' | 'info', message: string} | null>(null)
  const [totalPhotoSize, setTotalPhotoSize] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bahanImageInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  
  const [formData, setFormData] = useState({
    nama_toko: '',
    tanggal: new Date().toISOString().split('T')[0],
    foto_nota_url: '' // Single main photo untuk nota
  })
  
  const [bahanItems, setBahanItems] = useState<BahanItem[]>([
    { nama: '', deskripsi: '', harga: 0, kuantitas: 1, satuan: 'pcs', kategori: '', gambar: [] }
  ])

  // Hitung total ukuran foto
  useEffect(() => {
    let totalSize = 0
    
    // Hituk ukuran foto nota
    if (formData.foto_nota_url) {
      totalSize += calculateBase64Size(formData.foto_nota_url)
    }
    
    // Hitung ukuran foto bahan
    bahanItems.forEach(item => {
      if (item.gambar) {
        item.gambar.forEach(gambar => {
          totalSize += calculateBase64Size(gambar)
        })
      }
    })
    
    setTotalPhotoSize(totalSize)
    
    // Tampilkan alert jika total size > 1MB
    if (totalSize > 1 * 1024 * 1024) {
      setUploadAlert({
        type: 'warning',
        message: `Total ukuran foto melebihi ${formatBytes(totalSize)}. Disarankan untuk mengurangi kualitas atau jumlah foto.`
      })
    } else {
      setUploadAlert(null)
    }
  }, [formData.foto_nota_url, bahanItems])

  // Fungsi untuk menghitung ukuran base64
  const calculateBase64Size = (base64String: string): number => {
    if (!base64String) return 0
    // Menghitung ukuran dari string base64
    const padding = (base64String.endsWith('==')) ? 2 : (base64String.endsWith('=')) ? 1 : 0
    return (base64String.length * 3) / 4 - padding
  }

  // Format bytes ke readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Upload foto nota utama dengan kompresi
  const handleNotaFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      setUploadAlert({
        type: 'error',
        message: `Ukuran file ${formatBytes(file.size)} melebihi batas maksimal 2MB.`
      })
      return
    }

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

    try {
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        try {
          let base64String = reader.result as string
          
          // Kompresi gambar jika ukurannya besar
          if (file.size > 500 * 1024) { // Jika > 500KB, kompresi
            base64String = await compressImage(base64String, 1024, 1024, 0.7)
            toast.success('Foto dioptimalkan untuk mengurangi ukuran')
          }
          
          setFormData(prev => ({ ...prev, foto_nota_url: base64String }))
          toast.success('Foto nota berhasil ditambahkan')
          
          setUploadAlert({
            type: 'info',
            message: `Foto nota berhasil diupload (${formatBytes(calculateBase64Size(base64String))})`
          })
        } catch (error) {
          toast.error('Gagal mengoptimalkan gambar')
        } finally {
          setIsUploading(false)
        }
      }
      
      reader.onerror = () => {
        toast.error('Gagal membaca file')
        setIsUploading(false)
      }
      
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Terjadi kesalahan saat upload')
      setIsUploading(false)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Upload foto untuk bahan tertentu dengan kompresi
  const handleBahanImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      setUploadAlert({
        type: 'error',
        message: `Ukuran file bahan melebihi batas maksimal 2MB.`
      })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file JPG, PNG, dan WebP yang diperbolehkan')
      return
    }

    try {
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        try {
          let base64String = reader.result as string
          
          // Kompresi gambar jika ukurannya besar
          if (file.size > 300 * 1024) { // Jika > 300KB, kompresi
            base64String = await compressImage(base64String, 800, 800, 0.6)
          }
          
          const updated = [...bahanItems]
          updated[index].gambar = [...(updated[index].gambar || []), base64String]
          setBahanItems(updated)
          
          toast.success('Gambar bahan berhasil ditambahkan')
          
          setUploadAlert({
            type: 'info',
            message: `Foto bahan berhasil diupload. Total foto: ${updated[index].gambar?.length || 0}`
          })
        } catch (error) {
          toast.error('Gagal mengoptimalkan gambar')
        }
      }
      
      reader.onerror = () => {
        toast.error('Gagal membaca file')
      }
      
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      if (bahanImageInputRefs.current[index]) {
        bahanImageInputRefs.current[index]!.value = ''
      }
    }
  }

  // Hapus gambar bahan
  const handleRemoveBahanImage = (bahanIndex: number, imageIndex: number) => {
    const updated = [...bahanItems]
    updated[bahanIndex].gambar = updated[bahanIndex].gambar?.filter((_, i) => i !== imageIndex)
    setBahanItems(updated)
    toast.success('Gambar dihapus')
  }

  // Hapus semua foto dari sebuah bahan
  const handleRemoveAllBahanImages = (index: number) => {
    const updated = [...bahanItems]
    updated[index].gambar = []
    setBahanItems(updated)
    toast.success('Semua foto bahan dihapus')
  }

  const handleAddBahan = () => {
    setBahanItems([
      ...bahanItems,
      { nama: '', deskripsi: '', harga: 0, kuantitas: 1, satuan: 'pcs', kategori: '', gambar: [] }
    ])
  }

  const handleRemoveBahan = (index: number) => {
    if (bahanItems.length > 1) {
      setBahanItems(bahanItems.filter((_, i) => i !== index))
      // Clean up ref
      delete bahanImageInputRefs.current[index]
    }
  }

  const handleBahanChange = (index: number, field: keyof BahanItem, value: any) => {
    const updated = [...bahanItems]
    updated[index] = { ...updated[index], [field]: value }
    setBahanItems(updated)
  }

  const calculateTotal = () => {
    return bahanItems.reduce((total, item) => 
      total + (Number(item.harga) * Number(item.kuantitas)), 0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi ukuran total foto
    if (totalPhotoSize > 5 * 1024 * 1024) { // 5MB
      setUploadAlert({
        type: 'error',
        message: `Total ukuran foto ${formatBytes(totalPhotoSize)} melebihi batas maksimal 5MB. Harap hapus beberapa foto atau gunakan gambar dengan ukuran lebih kecil.`
      })
      toast.error('Ukuran foto terlalu besar. Mohon optimalkan foto sebelum menyimpan.')
      return
    }
    
    if (totalPhotoSize > 1 * 1024 * 1024) { // 1MB warning
      const confirmSave = window.confirm(
        `Total ukuran foto ${formatBytes(totalPhotoSize)} cukup besar. Ini mungkin menyebabkan error saat menyimpan.\n\nApakah Anda ingin melanjutkan?`
      )
      if (!confirmSave) return
    }
    
    // Validation lainnya
    if (!formData.nama_toko.trim()) {
      toast.error('Nama toko harus diisi')
      return
    }

    if (bahanItems.some(item => !item.nama.trim() || item.harga <= 0 || item.kuantitas <= 0)) {
      toast.error('Semua bahan harus memiliki nama, harga, dan kuantitas yang valid')
      return
    }

    setIsSubmitting(true)

    try {
      // Parse tanggal
      const [year, month, day] = formData.tanggal.split('-').map(Number)
      const tanggalBelanja = new Date(year, month - 1, day)
      tanggalBelanja.setHours(12, 0, 0, 0)
      
      if (isNaN(tanggalBelanja.getTime())) {
        toast.error('Format tanggal tidak valid')
        setIsSubmitting(false)
        return
      }

      // Siapkan data
      const notaData = {
        proyekId,
        namaToko: formData.nama_toko,
        fotoNotaUrl: formData.foto_nota_url || '',
        tanggalBelanja: tanggalBelanja.toISOString(),
        bahan_items: bahanItems.map(item => ({
          nama: item.nama,
          deskripsi: item.deskripsi || undefined,
          harga: Number(item.harga),
          kuantitas: Number(item.kuantitas),
          satuan: item.satuan,
          kategori: item.kategori || undefined,
          gambar: item.gambar && item.gambar.length > 0 ? item.gambar : undefined
        }))
      }

      console.log('Data yang dikirim:', notaData)
      console.log('Total photo size:', formatBytes(totalPhotoSize))

      const result = await createNotaWithBahan(notaData)

      if (result.success) {
        toast.success(result.message || 'Nota berhasil dibuat')
        onClose()
        resetForm()
      } else {
        toast.error(result.error || 'Gagal membuat nota')
      }
    } catch (error) {
      console.error('Error creating nota:', error)
      toast.error('Terjadi kesalahan: ' + 
        (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nama_toko: '',
      tanggal: new Date().toISOString().split('T')[0],
      foto_nota_url: ''
    })
    setBahanItems([
      { nama: '', deskripsi: '', harga: 0, kuantitas: 1, satuan: 'pcs', kategori: '', gambar: [] }
    ])
    bahanImageInputRefs.current = {}
    setUploadAlert(null)
    setTotalPhotoSize(0)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Nota Belanja Baru"
      size="xl"
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
            <h3 className="text-sm font-semibold text-blue-900">Informasi Nota</h3>
            <div className="text-xs text-gray-500">
              Total ukuran foto: <span className={`font-semibold ${totalPhotoSize > 1 * 1024 * 1024 ? 'text-yellow-600' : 'text-green-600'}`}>
                {formatBytes(totalPhotoSize)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Toko *"
              placeholder="Contoh: Toko Bangunan Sumber Jaya"
              value={formData.nama_toko}
              onChange={(e) => setFormData({...formData, nama_toko: e.target.value})}
              className="bg-white"
              required
            />
            
            <Input
              label="Tanggal Belanja *"
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
              className="bg-white"
              required
            />
          </div>

          {/* Upload Foto Nota - FULL SIZE */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Foto Nota
              </label>
              {formData.foto_nota_url && (
                <button
                  type="button"
                  onClick={() => setFormData({...formData, foto_nota_url: ''})}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
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
            />
            
            {!formData.foto_nota_url ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors bg-white hover:bg-blue-50 flex flex-col items-center justify-center"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-600">Mengoptimalkan gambar...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-700">Klik untuk upload foto nota</p>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Maks. 2MB)</p>
                    <p className="text-xs text-gray-400 mt-2">Gambar akan dioptimalkan secara otomatis</p>
                  </>
                )}
              </div>
            ) : (
              <div className="relative w-full">
                <img 
                  src={formData.foto_nota_url} 
                  alt="Foto nota"
                  className="w-full h-48 object-cover rounded-lg border-2 border-blue-200"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {formatBytes(calculateBase64Size(formData.foto_nota_url))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, foto_nota_url: ''})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bahan Items Section */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-green-900">
              Daftar Bahan * ({bahanItems.length} item)
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddBahan}
              className="flex items-center gap-1 text-sm h-8 border-green-300 hover:bg-green-100"
            >
              <Plus className="w-4 h-4" />
              Tambah Bahan
            </Button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {bahanItems.map((item, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs">
                      {index + 1}
                    </span>
                    Bahan #{index + 1}
                  </h4>
                  <div className="flex gap-2">
                    {item.gambar && item.gambar.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAllBahanImages(index)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus semua foto
                      </button>
                    )}
                    {bahanItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveBahan(index)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Grid Layout - Semua field sejajar */}
                <div className="grid grid-cols-12 gap-3">
                  {/* Nama Bahan - 4 cols */}
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      label="Nama Bahan *"
                      placeholder="Nama bahan"
                      value={item.nama}
                      onChange={(e) => handleBahanChange(index, 'nama', e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Kategori - 2 cols */}
                  <div className="col-span-12 md:col-span-2">
                    <Input
                      label="Kategori"
                      placeholder="Kategori"
                      value={item.kategori || ''}
                      onChange={(e) => handleBahanChange(index, 'kategori', e.target.value)}
                    />
                  </div>
                  
                  {/* Harga - 2 cols */}
                  <div className="col-span-6 md:col-span-2">
                    <Input
                      label="Harga *"
                      type="number"
                      placeholder="0"
                      value={item.harga || ''}
                      onChange={(e) => handleBahanChange(index, 'harga', Number(e.target.value))}
                      required
                      min="0"
                    />
                  </div>
                  
                  {/* Kuantitas - 2 cols */}
                  <div className="col-span-6 md:col-span-2">
                    <Input
                      label="Qty *"
                      type="number"
                      placeholder="1"
                      value={item.kuantitas || ''}
                      onChange={(e) => handleBahanChange(index, 'kuantitas', Number(e.target.value))}
                      required
                      min="1"
                    />
                  </div>
                  
                  {/* Satuan - 2 cols */}
                  <div className="col-span-12 md:col-span-2">
                    <Input
                      label="Satuan *"
                      placeholder="pcs/kg/m"
                      value={item.satuan}
                      onChange={(e) => handleBahanChange(index, 'satuan', e.target.value)}
                      required
                    />
                  </div>

                  {/* Deskripsi - Full width menggunakan Textarea component */}
                  <div className="col-span-12">
                    <Textarea
                      label="Deskripsi"
                      placeholder="Deskripsi atau catatan tambahan..."
                      value={item.deskripsi || ''}
                      onChange={(e) => handleBahanChange(index, 'deskripsi', e.target.value)}
                      rows={2}
                      className="bg-white"
                    />
                  </div>

                  {/* Upload Gambar Bahan - FULL SIZE seperti foto nota */}
                  <div className="col-span-12">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Foto Bahan {item.gambar && item.gambar.length > 0 && `(${item.gambar.length})`}
                      </label>
                      {item.gambar && item.gambar.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {formatBytes(item.gambar.reduce((sum, img) => sum + calculateBase64Size(img), 0))}
                        </span>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      ref={(el) => { bahanImageInputRefs.current[index] = el }}
                      onChange={(e) => handleBahanImageUpload(index, e)}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                    />
                    
                    {item.gambar && item.gambar.length > 0 ? (
                      <div className="space-y-2">
                        {/* Preview gambar utama - ukuran sama dengan foto nota */}
                        <div className="relative w-full">
                          <img 
                            src={item.gambar[0]} 
                            alt={`Bahan ${index + 1} foto utama`}
                            className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {formatBytes(calculateBase64Size(item.gambar[0]))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBahanImage(index, 0)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Thumbnail untuk gambar tambahan */}
                        {item.gambar.length > 1 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <p className="w-full text-xs text-gray-500 mb-1">Gambar tambahan:</p>
                            {item.gambar.slice(1).map((img, imgIndex) => (
                              <div key={imgIndex + 1} className="relative group">
                                <img 
                                  src={img} 
                                  alt={`Bahan ${index + 1} foto ${imgIndex + 2}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-300"
                                />
                                <div className="absolute bottom-0.5 left-0.5 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                  {formatBytes(calculateBase64Size(img))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBahanImage(index, imgIndex + 1)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            
                            {/* Button tambah gambar lagi */}
                            <button
                              type="button"
                              onClick={() => bahanImageInputRefs.current[index]?.click()}
                              className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                            >
                              <Plus className="w-5 h-5 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Tambah</span>
                            </button>
                          </div>
                        )}
                        
                        {item.gambar.length === 1 && (
                          <button
                            type="button"
                            onClick={() => bahanImageInputRefs.current[index]?.click()}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah gambar lain
                          </button>
                        )}
                      </div>
                    ) : (
                      // Area upload kosong - ukuran sama dengan foto nota
                      <div 
                        onClick={() => bahanImageInputRefs.current[index]?.click()}
                        className="w-full h-48 border-2 border-dashed border-green-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition-colors bg-white hover:bg-green-50 flex flex-col items-center justify-center"
                      >
                        <ImageIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-700">Upload foto bahan</p>
                        <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Maks. 2MB)</p>
                        <p className="text-xs text-gray-400 mt-2">Gambar akan dioptimalkan otomatis</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtotal */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                  <span className="text-sm text-gray-600">Subtotal: </span>
                  <span className="font-bold text-lg text-green-600">
                    Rp {(item.harga * item.kuantitas).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary dengan Warning */}
        <div className={`rounded-lg p-4 border ${totalPhotoSize > 5 * 1024 * 1024 ? 'bg-red-50 border-red-200' : totalPhotoSize > 1 * 1024 * 1024 ? 'bg-yellow-50 border-yellow-200' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Item</p>
              <p className="text-lg font-bold text-gray-900">{bahanItems.length} item</p>
              <p className={`text-xs mt-1 ${totalPhotoSize > 5 * 1024 * 1024 ? 'text-red-600' : totalPhotoSize > 1 * 1024 * 1024 ? 'text-yellow-600' : 'text-green-600'}`}>
                Total ukuran foto: {formatBytes(totalPhotoSize)}
                {totalPhotoSize > 1 * 1024 * 1024 && ' ⚠️'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total Harga</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {calculateTotal().toLocaleString('id-ID')}
              </p>
              {totalPhotoSize > 5 * 1024 * 1024 && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ Ukuran foto terlalu besar!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose()
              resetForm()
            }}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            Batal
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || totalPhotoSize > 10 * 1024 * 1024}
            className={`min-w-[140px] shadow-lg ${
              totalPhotoSize > 5 * 1024 * 1024 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
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
                <Plus className="w-4 h-4 mr-2" />
                Simpan Nota
              </>
            )}
          </Button>
        </div>
        
        {/* Informasi tambahan */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          <p>Pastikan total ukuran foto di bawah <strong>5MB</strong> untuk hasil terbaik.</p>
          <p>Gambar akan dikompresi secara otomatis untuk mengurangi ukuran.</p>
        </div>
      </form>
    </Modal>
  )
}