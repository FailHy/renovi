// FILE: components/mandor/BahanHarianTab.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Package, 
  DollarSign, 
  BarChart3, 
  Plus, 
  RefreshCw, 
  Upload,
  Edit2,
  Trash2,
  Eye,
  FileText,
  X,
  Download,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils/mandorUtils'
import type { Project, Milestone, BahanHarian } from './types'

interface BahanHarianTabProps {
  project: Project
  milestones: Milestone[]
}

export function BahanHarianTab({ project, milestones }: BahanHarianTabProps) {
  const [bahanList, setBahanList] = useState<BahanHarian[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newPreviews: string[] = []
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // Max 5MB
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === files.length) {
            setPreviewImages(prev => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      } else if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} terlalu besar (max 5MB)`)
      }
    })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove preview image
  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  // Load bahan data
  const loadBahanData = async () => {
    setLoading(true)
    try {
      const { getBahanMasukByProyek } = await import('@/lib/actions/mandor/bahan')
      const result = await getBahanMasukByProyek(project.id)
      
      if (result.success) {
        setBahanList(result.data || [])
      } else {
        toast.error('Gagal memuat data bahan')
      }
    } catch (error) {
      console.error('Error loading bahan:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  // Submit bahan form
  const handleSubmitBahan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      // Simulasi upload gambar (di production, ini akan upload ke server)
      const gambarUrls = previewImages.map((preview, index) => {
        // Di production, ini akan return URL dari cloud storage
        return `https://via.placeholder.com/150/007acc/ffffff?text=Gambar+${index + 1}`
      })
      
      const { createBahanMasuk } = await import('@/lib/actions/mandor/bahan')
      
      const result = await createBahanMasuk({
        proyekId: project.id,
        nama: formData.get('nama') as string,
        deskripsi: formData.get('deskripsi') as string || undefined,
        harga: Number(formData.get('harga')),
        kuantitas: Number(formData.get('kuantitas')),
        satuan: formData.get('satuan') as string,
        status: (formData.get('status') as any) || 'Digunakan',
        milestoneId: formData.get('milestoneId') as string || undefined,
        tanggal: new Date(),
        gambar: gambarUrls // Simpan URL gambar
      })
      
      if (result.success) {
        toast.success('Bahan berhasil ditambahkan')
        setShowForm(false)
        setPreviewImages([])
        await loadBahanData()
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
      } else {
        toast.error(result.error || 'Gagal menambahkan bahan')
      }
    } catch (error) {
      console.error('Error submitting bahan:', error)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Delete bahan
  const handleDeleteBahan = async (bahanId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus bahan ini?')) return
    
    try {
      const { deleteBahanMasuk } = await import('@/lib/actions/mandor/bahan')
      const result = await deleteBahanMasuk(bahanId)
      
      if (result.success) {
        toast.success('Bahan berhasil dihapus')
        await loadBahanData()
      } else {
        toast.error(result.error || 'Gagal menghapus bahan')
      }
    } catch (error) {
      console.error('Error deleting bahan:', error)
      toast.error('Terjadi kesalahan saat menghapus')
    }
  }

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      const { exportBahanToPDF } = await import('@/lib/utils/exportPdf')
      const exportData = filteredBahan.map(bahan => ({
        nama: bahan.nama,
        deskripsi: bahan.deskripsi || '',
        status: bahan.status,
        kuantitas: bahan.kuantitas,
        satuan: bahan.satuan,
        harga: bahan.harga,
        total: bahan.harga * bahan.kuantitas,
        tanggal: new Date(bahan.tanggal).toLocaleDateString('id-ID'),
        milestone: milestones.find(m => m.id === bahan.milestoneId)?.nama || ''
      }))

      await exportBahanToPDF(
        project.nama,
        exportData,
        {
          totalItems: filteredBahan.length,
          totalCost: filteredBahan.reduce((sum, item) => 
            sum + (item.harga * item.kuantitas), 0
          )
        }
      )
      
      toast.success('PDF berhasil di-generate')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Gagal membuat PDF')
    } finally {
      setShowExportMenu(false)
    }
  }

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      const { exportBahanToExcel } = await import('@/lib/utils/exportExcel')
      const exportData = filteredBahan.map(bahan => ({
        ...bahan,
        total: bahan.harga * bahan.kuantitas,
        tanggal: new Date(bahan.tanggal).toLocaleDateString('id-ID'),
        milestone: milestones.find(m => m.id === bahan.milestoneId)?.nama || '',
        gambar: bahan.gambar ? `${bahan.gambar.length} gambar` : 'Tidak ada'
      }))

      exportBahanToExcel(project.nama, exportData)
      toast.success('Excel berhasil di-generate')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      toast.error('Gagal membuat Excel')
    } finally {
      setShowExportMenu(false)
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const totalCost = bahanList.reduce((sum, item) => sum + (item.harga * item.kuantitas), 0)
    const totalItems = bahanList.length
    
    const byStatus = bahanList.reduce((acc: any, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})

    return { totalCost, totalItems, byStatus }
  }

  const stats = calculateStats()
  const filteredBahan = filterStatus === 'all' 
    ? bahanList 
    : bahanList.filter(item => item.status === filterStatus)

  // Load data on mount
  useEffect(() => {
    loadBahanData()
  }, [project.id])

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Digunakan':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      case 'Sisa':
        return 'bg-amber-100 text-amber-700 border border-amber-200'
      case 'Rusak':
        return 'bg-rose-100 text-rose-700 border border-rose-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  // Satuan options
  const satuanOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'sak', label: 'Sak' },
    { value: 'm2', label: 'Meter Persegi (m²)' },
    { value: 'm3', label: 'Meter Kubik (m³)' },
    { value: 'buah', label: 'Buah' },
    { value: 'lembar', label: 'Lembar' },
    { value: 'meter', label: 'Meter' },
    { value: 'liter', label: 'Liter' },
    { value: 'roll', label: 'Roll' },
    { value: 'unit', label: 'Unit' }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Total Bahan</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalItems}
                </p>
                <p className="text-xs text-slate-500">item</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Total Biaya</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 mb-2">Status Bahan</p>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(stats.byStatus).map(([status, count]) => (
                    <Badge 
                      key={status} 
                      className={`text-xs font-semibold ${getStatusColor(status)}`}
                    >
                      {status}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold shadow-md"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Tutup Form</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Tambah Bahan</span>
            </>
          )}
        </Button>
        
        <div className="flex gap-2 flex-1">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="Digunakan">🟢 Digunakan</option>
            <option value="Sisa">🟡 Sisa</option>
            <option value="Rusak">🔴 Rusak</option>
          </select>
          <Button
            variant="outline"
            onClick={loadBahanData}
            className="flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={filteredBahan.length === 0 || loading}
              className="flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 border-b border-slate-100 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export ke PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export ke Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Bahan Form */}
      {showForm && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tambah Bahan Baru
                  </h3>
                  <p className="text-sm text-slate-600">
                    Isi form untuk menambahkan bahan
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmitBahan} className="space-y-4">
              {/* Nama dan Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Bahan *"
                  name="nama"
                  placeholder="Semen Portland, Pasir Cor, dll"
                  required
                  className="bg-white"
                />
                <Select
                  label="Status *"
                  name="status"
                  options={[
                    { value: 'Digunakan', label: '🟢 Digunakan' },
                    { value: 'Sisa', label: '🟡 Sisa' },
                    { value: 'Rusak', label: '🔴 Rusak' }
                  ]}
                  defaultValue="Digunakan"
                  required
                  className="bg-white"
                />
              </div>

              {/* Harga, Kuantitas, Satuan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Harga (Rp) *"
                  type="number"
                  name="harga"
                  placeholder="0"
                  min="0"
                  step="1000"
                  required
                  className="bg-white"
                />
                <Input
                  label="Kuantitas *"
                  type="number"
                  step="0.01"
                  name="kuantitas"
                  placeholder="1"
                  min="0.01"
                  required
                  className="bg-white"
                />
                <Select
                  label="Satuan *"
                  name="satuan"
                  options={satuanOptions}
                  defaultValue="buah"
                  required
                  className="bg-white"
                />
              </div>

              {/* Deskripsi */}
              <Textarea
                label="Deskripsi (Opsional)"
                name="deskripsi"
                placeholder="Deskripsikan bahan atau catatan khusus..."
                rows={3}
                className="bg-white"
              />

              {/* Milestone & Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Milestone Terkait (Opsional)"
                  name="milestoneId"
                  options={[
                    { value: '', label: 'Pilih Milestone...' },
                    ...milestones.map(m => ({
                      value: m.id,
                      label: m.nama
                    }))
                  ]}
                  className="bg-white"
                />
                <Input
                  label="Tanggal Penggunaan *"
                  type="date"
                  name="tanggal"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="bg-white"
                />
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Foto (Opsional, max 5MB per file)
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 bg-white rounded-xl p-6 text-center hover:border-blue-500 transition-all hover:bg-blue-50"
                  >
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      Klik untuk Upload Foto
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, JPEG (max 5MB per file)
                    </p>
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Image Previews */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-100">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePreviewImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                            title="Hapus gambar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t-2 border-blue-200">
                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 font-bold shadow-lg"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>Simpan Bahan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bahan List - Mobile Cards / Desktop Table */}
      <Card className="bg-white border-0 shadow-md">
        <div className="p-4 border-b-2 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Daftar Bahan
          </h3>
          <p className="text-sm text-slate-600">
            {filteredBahan.length} bahan ditemukan
          </p>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 font-medium">Memuat data bahan...</p>
          </div>
        ) : filteredBahan.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-900 font-bold text-lg mb-2">
              {filterStatus === 'all' 
                ? 'Belum ada data bahan' 
                : `Tidak ada bahan "${filterStatus}"`
              }
            </p>
            {filterStatus !== 'all' && (
              <Button
                variant="ghost"
                onClick={() => setFilterStatus('all')}
                className="text-sm mt-2 text-blue-600 hover:text-blue-700"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredBahan.map((bahan) => (
                <div key={bahan.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">
                          {bahan.nama}
                        </h4>
                        {bahan.deskripsi && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {bahan.deskripsi}
                          </p>
                        )}
                      </div>
                      <Badge className={`text-xs font-semibold ${getStatusColor(bahan.status)}`}>
                        {bahan.status}
                      </Badge>
                    </div>
                    
                    {/* Display Images in Mobile */}
                    {bahan.gambar && bahan.gambar.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {bahan.gambar.slice(0, 3).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className="relative flex-shrink-0"
                          >
                            <div className="w-16 h-16 rounded-lg border-2 border-slate-200 overflow-hidden">
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <img 
                                  src={img} 
                                  alt={`Gambar ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                        {bahan.gambar.length > 3 && (
                          <div className="w-16 h-16 rounded-lg border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600">
                            +{bahan.gambar.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">Kuantitas</span>
                        <span className="font-semibold text-slate-900">
                          {bahan.kuantitas} {bahan.satuan}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">Harga</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(bahan.harga)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">Total</span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(bahan.harga * bahan.kuantitas)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">Tanggal</span>
                        <span className="font-semibold text-slate-900">
                          {formatDate(bahan.tanggal)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <Button
                        variant="outline"
                        className="flex-1 h-9 text-xs border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                        onClick={() => setSelectedImage(bahan.gambar?.[0] || null)}
                        disabled={!bahan.gambar || bahan.gambar.length === 0}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Lihat Gambar
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 px-3 text-xs border-2 border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold"
                        onClick={() => handleDeleteBahan(bahan.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nama Bahan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBahan.map((bahan) => (
                    <tr key={bahan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {bahan.nama}
                          </p>
                          {bahan.deskripsi && (
                            <p className="text-sm text-slate-600 truncate max-w-xs">
                              {bahan.deskripsi}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* Image Column */}
                      <td className="px-4 py-3">
                        {bahan.gambar && bahan.gambar.length > 0 ? (
                          <div className="flex gap-2">
                            {bahan.gambar.slice(0, 3).map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className="relative group"
                                title="Klik untuk melihat"
                              >
                                <div className="w-10 h-10 rounded-lg border-2 border-slate-200 overflow-hidden hover:border-blue-500 transition-all">
                                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <img 
                                      src={img} 
                                      alt={`Gambar ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.parentElement!.innerHTML = '📷'
                                      }}
                                    />
                                  </div>
                                </div>
                                {idx === 2 && bahan.gambar!.length > 3 && (
                                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                    +{bahan.gambar!.length - 3}
                                  </div>
                                )}
                              </button>
                            ))}
                            {bahan.gambar.length > 3 && (
                              <div className="text-xs text-slate-500 flex items-center">
                                +{bahan.gambar.length - 3} lagi
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">Tidak ada gambar</div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <Badge className={`text-xs font-semibold ${getStatusColor(bahan.status)}`}>
                          {bahan.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {bahan.kuantitas} {bahan.satuan}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatCurrency(bahan.harga)}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        {formatCurrency(bahan.harga * bahan.kuantitas)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(bahan.tanggal)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => setSelectedImage(bahan.gambar?.[0] || null)}
                            disabled={!bahan.gambar || bahan.gambar.length === 0}
                            title="Lihat Gambar"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDeleteBahan(bahan.id)}
                            disabled={loading}
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Preview Gambar</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedImage(null)}
                className="text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-center gap-3">
              <a 
                href={selectedImage} 
                download 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4" />
                Download Gambar
              </a>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
                className="border-2 border-slate-300"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}