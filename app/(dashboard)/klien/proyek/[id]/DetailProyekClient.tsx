// FILE: app/(dashboard)/klien/proyek/[id]/DetailProyekKlienClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Star, 
  MessageSquare, 
  Package, 
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Home,
  ShoppingBag,
  Sparkles
} from 'lucide-react'
import { createTestimoni } from '@/lib/actions/klien/testimoni'
import toast from 'react-hot-toast'

interface DetailProyekKlienClientProps {
  proyek: {
    id: string
    nama: string
    tipeLayanan: string
    deskripsi: string | null
    alamat: string
    status: string
    progress: number
    tanggalMulai: Date
    tanggalSelesai: Date | null
    mandor: {
      id: string
      nama: string
      telpon: string | null
    }
    hasTestimoni: boolean
  }
  milestones: Array<{
    id: string
    nama: string
    deskripsi: string | null
    status: string
    targetSelesai: Date | null
    tanggalSelesai: Date | null
  }>
  bahan: Array<{
    id: string
    nama: string
    deskripsi: string | null
    harga: string
    kuantitas: string
    satuan: string
    kategori: string | null
    status: string
    createdAt: Date
    nota: {
      namaToko: string | null
      tanggalBelanja: Date
    }
  }>
  klienId: string
}

export function DetailProyekKlienClient({
  proyek,
  milestones,
  bahan,
  klienId
}: DetailProyekKlienClientProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'milestone' | 'bahan'>('info')
  const [isTestimoniModalOpen, setIsTestimoniModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [komentar, setKomentar] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Progress-based testimoni eligibility
  const canSubmitTestimoni = 
    proyek.progress === 100 && 
    proyek.status === 'Selesai' && 
    !proyek.hasTestimoni

  useEffect(() => {
    // Show notification if project is completed but no testimoni yet
    if (canSubmitTestimoni) {
      toast.success(
        'Proyek sudah selesai 100%! Anda bisa memberikan testimoni.', 
        { 
          duration: 5000,
          icon: '🎉'
        }
      )
    }
  }, [canSubmitTestimoni])

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Perencanaan': 'bg-blue-100 text-blue-800 border-blue-200',
      'Dalam Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Selesai': 'bg-green-100 text-green-800 border-green-200',
      'Dibatalkan': 'bg-red-100 text-red-800 border-red-200',
      'Belum Dimulai': 'bg-gray-100 text-gray-800 border-gray-200',
      'Digunakan': 'bg-green-100 text-green-800 border-green-200',
      'Sisa': 'bg-blue-100 text-blue-800 border-blue-200',
      'Rusak': 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const handleSubmitTestimoni = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!komentar.trim()) {
      toast.error('Komentar tidak boleh kosong')
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error('Rating harus antara 1-5')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Mengirim testimoni...')

    try {
      // Sesuai dengan structure dari testimoni.ts
      const result = await createTestimoni({
        proyekId: proyek.id,
        klienId: klienId,
        rating,
        komentar: komentar.trim()
      })

      if (result.success) {
        toast.success('Testimoni berhasil dikirim!', { id: toastId })
        setIsTestimoniModalOpen(false)
        setKomentar('')
        setRating(5)
        // Refresh untuk update hasTestimoni
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error(result.error || 'Gagal mengirim testimoni', { id: toastId })
      }
    } catch (error) {
      console.error('Error submitting testimoni:', error)
      toast.error('Terjadi kesalahan', { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total bahan cost
  const totalBahanCost = bahan.reduce((sum, item) => {
    return sum + (parseFloat(item.harga) * parseFloat(item.kuantitas))
  }, 0)

  // Progress Bar Component
  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(proyek.status)}`}>
                {proyek.status}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{proyek.nama}</h1>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Proyek</span>
                  <span className="text-lg font-bold text-gray-900">{proyek.progress}%</span>
                </div>
                <ProgressBar value={proyek.progress} />
              </div>

              {/* Testimoni Status */}
              <div className="pt-4 border-t">
                {canSubmitTestimoni && (
                  <button
                    onClick={() => setIsTestimoniModalOpen(true)}
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md"
                  >
                    <Sparkles className="w-5 h-5" />
                    Berikan Testimoni
                  </button>
                )}
                
                {proyek.hasTestimoni && (
                  <div className="inline-flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Testimoni sudah diberikan</span>
                  </div>
                )}
                
                {proyek.progress < 100 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Testimoni dapat diberikan setelah proyek selesai 100%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Container */}
      <div className="bg-white rounded-xl shadow">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 font-medium text-center ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi
            </div>
          </button>
          <button
            onClick={() => setActiveTab('milestone')}
            className={`flex-1 py-4 font-medium text-center ${activeTab === 'milestone' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Milestone ({milestones.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bahan')}
            className={`flex-1 py-4 font-medium text-center ${activeTab === 'bahan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Bahan ({bahan.length})
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Deskripsi Proyek
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {proyek.deskripsi || "Tidak ada deskripsi tersedia."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Lokasi Proyek
                  </h3>
                  <p className="text-gray-700">{proyek.alamat}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Tanggal Mulai</h4>
                    <p className="font-medium text-gray-900">{formatDate(proyek.tanggalMulai)}</p>
                  </div>
                  {proyek.tanggalSelesai && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Tanggal Selesai</h4>
                      <p className="font-medium text-green-600">{formatDate(proyek.tanggalSelesai)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mandor Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Mandor Penanggung Jawab
                  </h3>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {proyek.mandor.nama.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{proyek.mandor.nama}</h4>
                        <p className="text-gray-600 text-sm">Mandor</p>
                      </div>
                    </div>

                    {proyek.mandor.telpon && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <a 
                          href={`tel:${proyek.mandor.telpon}`}
                          className="text-blue-600 font-medium hover:text-blue-700"
                        >
                          {proyek.mandor.telpon}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistik</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
                      <div className="text-sm text-gray-600">Milestones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{bahan.length}</div>
                      <div className="text-sm text-gray-600">Bahan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {milestones.filter(m => m.status === 'Selesai').length}
                      </div>
                      <div className="text-sm text-gray-600">Selesai</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {formatCurrency(totalBahanCost)}
                      </div>
                      <div className="text-sm text-gray-600">Total Biaya</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Tab */}
          {activeTab === 'milestone' && (
            <div>
              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">#{index + 1}</span>
                            <h4 className="font-semibold text-gray-900">{milestone.nama}</h4>
                          </div>
                          {milestone.deskripsi && (
                            <p className="text-gray-600 text-sm mb-2">{milestone.deskripsi}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {milestone.targetSelesai && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Target: {formatDate(milestone.targetSelesai)}</span>
                          </div>
                        )}
                        {milestone.tanggalSelesai && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">
                              Selesai: {formatDate(milestone.tanggalSelesai)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada milestone</h3>
                  <p className="text-gray-600">Milestone akan ditambahkan oleh mandor.</p>
                </div>
              )}
            </div>
          )}

          {/* Bahan Tab */}
          {activeTab === 'bahan' && (
            <div>
              {bahan.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Daftar Bahan Material</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Biaya</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(totalBahanCost)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-700">Nama</th>
                          <th className="text-left p-3 font-medium text-gray-700">Kuantitas</th>
                          <th className="text-left p-3 font-medium text-gray-700">Harga</th>
                          <th className="text-left p-3 font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bahan.map((item) => {
                          const total = parseFloat(item.harga) * parseFloat(item.kuantitas)
                          return (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-gray-900">{item.nama}</p>
                                  {item.kategori && (
                                    <span className="text-xs text-gray-500">{item.kategori}</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium">
                                  {item.kuantitas} {item.satuan}
                                </div>
                              </td>
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-gray-900">{formatCurrency(item.harga)}</p>
                                  <p className="text-sm text-green-600 font-medium">
                                    Total: {formatCurrency(total)}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada bahan material</h3>
                  <p className="text-gray-600">Daftar bahan akan muncul setelah mandor menambahkan pembelian.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Testimoni Modal */}
      {isTestimoniModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Berikan Testimoni</h2>
                <p className="text-gray-600">Proyek: {proyek.nama}</p>
              </div>

              <form onSubmit={handleSubmitTestimoni} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Rating Kepuasan
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {rating === 5 && 'Sangat Puas'}
                    {rating === 4 && 'Puas'}
                    {rating === 3 && 'Cukup'}
                    {rating === 2 && 'Kurang Puas'}
                    {rating === 1 && 'Tidak Puas'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Komentar
                  </label>
                  <textarea
                    value={komentar}
                    onChange={(e) => setKomentar(e.target.value)}
                    placeholder="Bagikan pengalaman Anda dengan proyek ini..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                {/* Validation from testimoni.ts */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Persyaratan Testimoni:</p>
                      <ul className="space-y-1">
                        <li>✓ Proyek harus berstatus "Selesai"</li>
                        <li>✓ Progress harus 100%</li>
                        <li>✓ Hanya bisa memberikan testimoni sekali</li>
                        <li>✓ Testimoni akan tampil di portofolio mandor</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsTestimoniModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Testimoni'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}