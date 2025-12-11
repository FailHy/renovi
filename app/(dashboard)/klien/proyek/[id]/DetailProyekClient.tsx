// FILE: app/(dashboard)/klien/proyek/[id]/DetailProyekKlienClient.tsx
'use client'

import { useState } from 'react'
import { Calendar, MapPin, User, Phone, Star, MessageSquare, Package, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/TextArea'
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
    hasTestimoni: boolean // ✅ Keep for backward compatibility
    testimoniData?: { // ✅ ADD THIS!
      id: string
      rating: number
      komentar: string
      approved: boolean
      createdAt: Date
    } | null
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

  // ✅ FIX: Add same logic as mandor side for status calculation
  const calculateDerivedStatus = () => {
    const totalMilestones = milestones.length
    
    if (totalMilestones === 0) {
      return proyek.status // Use database status if no milestones
    }

    const cancelledMilestones = milestones.filter(m => m.status === 'Dibatalkan').length
    const completedMilestones = milestones.filter(m => m.status === 'Selesai').length
    const inProgressMilestones = milestones.filter(m => m.status === 'Dalam Progress').length
    
    const effectiveTotal = totalMilestones - cancelledMilestones

    // 1. Jika semua milestone aktif sudah selesai -> Selesai
    if (effectiveTotal > 0 && completedMilestones === effectiveTotal) {
      return 'Selesai'
    }

    // 2. Jika ada yang sedang progress atau minimal satu selesai -> Dalam Progress
    if (inProgressMilestones > 0 || completedMilestones > 0) {
      return 'Dalam Progress'
    }

    // 3. Jika semua dibatalkan -> Dibatalkan
    if (cancelledMilestones === totalMilestones) {
      return 'Dibatalkan'
    }

    // 4. Sisanya (semua Belum Dimulai) -> Perencanaan
    return 'Perencanaan'
  }

  // ✅ Use derived status instead of database status
  const displayStatus = calculateDerivedStatus()

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
      'Perencanaan': 'info',
      'Dalam Progress': 'warning',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
      'Belum Dimulai': 'info',
      'Digunakan': 'success',
      'Sisa': 'warning',
      'Rusak': 'danger',
    }
    return variants[status] || 'default'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Perencanaan': 'bg-blue-100 text-blue-800 border-blue-300',
      'Dalam Progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Selesai': 'bg-green-100 text-green-800 border-green-300',
      'Dibatalkan': 'bg-red-100 text-red-800 border-red-300',
      'Belum Dimulai': 'bg-gray-100 text-gray-800 border-gray-300',
      'Digunakan': 'bg-green-100 text-green-800 border-green-300',
      'Sisa': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Rusak': 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const handleSubmitTestimoni = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!komentar.trim()) {
      toast.error('Komentar tidak boleh kosong')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Mengirim testimoni...')

    try {
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
        // Refresh page to update hasTestimoni status
        window.location.reload()
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
<div className="flex justify-between items-start">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">{proyek.nama}</h1>
    <p className="text-gray-600">{proyek.tipeLayanan}</p>
  </div>
  
  {/* ✅ FIX LOGIC TESTIMONI */}
  {displayStatus === 'Selesai' && proyek.progress === 100 && (
    <div>
      {/* State 1: Belum ada testimoni sama sekali */}
      {!proyek.testimoniData ? (
        <Button
          onClick={() => setIsTestimoniModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Star className="w-4 h-4 mr-2" />
          Berikan Testimoni
        </Button>
      ) : 
      /* State 2: Sudah kirim tapi belum di-approve */
      proyek.testimoniData.approved === false ? (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
          <Clock className="w-4 h-4" /> {/* ✅ Tambahkan import Clock */}
          <span className="text-sm font-medium">Testimoni menunggu persetujuan admin</span>
        </div>
      ) : 
      /* State 3: Sudah di-approve */
      (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Testimoni sudah diberikan</span>
          {proyek.testimoniData.rating && (
            <div className="flex ml-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < proyek.testimoniData!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Informasi Proyek
        </button>
        <button
          onClick={() => setActiveTab('milestone')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'milestone'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Milestone ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('bahan')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'bahan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Bahan Material ({bahan.length})
        </button>
      </div>

      {/* Tab Content: Info */}
      {activeTab === 'info' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Proyek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getStatusColor(displayStatus)}`}>
                  {displayStatus}
                </span>
                
                {/* Debug info - can be removed in production */}
                {displayStatus !== proyek.status && (
                  <div className="mt-2 text-xs text-gray-500">
                    Status di database: {proyek.status} → Status aktual: {displayStatus}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Progress Proyek
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{proyek.progress}%</span>
                    <span className="text-sm text-gray-500">Target selesai</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        proyek.progress === 100 
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${proyek.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {proyek.deskripsi && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    Deskripsi
                  </label>
                  <p className="text-gray-700 leading-relaxed">{proyek.deskripsi}</p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Lokasi Proyek
                  </label>
                  <p className="text-gray-900">{proyek.alamat}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Tanggal Mulai
                    </label>
                    <p className="text-gray-900 font-medium">{formatDate(proyek.tanggalMulai)}</p>
                  </div>
                </div>
                
                {proyek.tanggalSelesai && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
                        Tanggal Selesai
                      </label>
                      <p className="text-gray-900 font-medium">{formatDate(proyek.tanggalSelesai)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Mandor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">
                    Nama Mandor
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">{proyek.mandor.nama}</p>
                </div>
              </div>

              {proyek.mandor.telpon && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">
                      Nomor Telepon
                    </label>
                    <a 
                      href={`tel:${proyek.mandor.telpon}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {proyek.mandor.telpon}
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Hubungi mandor untuk informasi lebih lanjut tentang progress proyek atau pertanyaan lainnya.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Milestone */}
      {activeTab === 'milestone' && (
        <div className="space-y-4">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-xl text-gray-900 mb-2">
                            {milestone.nama}
                          </h4>
                          {milestone.deskripsi && (
                            <p className="text-gray-600 leading-relaxed">
                              {milestone.deskripsi}
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ml-4 ${getStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-6 text-sm">
                        {milestone.targetSelesai && (
                          <div>
                            <span className="text-gray-500">Target:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {formatDate(milestone.targetSelesai)}
                            </span>
                          </div>
                        )}
                        {milestone.tanggalSelesai && (
                          <div>
                            <span className="text-gray-500">Selesai:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatDate(milestone.tanggalSelesai)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada milestone
                </h3>
                <p className="text-gray-600">
                  Milestone akan ditambahkan oleh mandor seiring berjalannya proyek
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Content: Bahan */}
      {activeTab === 'bahan' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Bahan Material</CardTitle>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Biaya Bahan</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalBahanCost)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bahan.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Bahan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Toko</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Kuantitas</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Harga Satuan</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bahan.map((item) => {
                      const total = parseFloat(item.harga) * parseFloat(item.kuantitas)
                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-gray-900">{item.nama}</p>
                              {item.kategori && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                  {item.kategori}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            {item.nota.namaToko || '-'}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-gray-900">
                            {item.kuantitas} {item.satuan}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-900">
                            {formatCurrency(item.harga)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-green-600">
                            {formatCurrency(total)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-700 text-sm">
                            {formatDate(item.nota.tanggalBelanja)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada bahan material
                </h3>
                <p className="text-gray-600">
                  Daftar bahan akan muncul setelah mandor menambahkan pembelian material
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testimoni Modal */}
      <Modal
        isOpen={isTestimoniModalOpen}
        onClose={() => setIsTestimoniModalOpen(false)}
        title="Bagikan Pengalaman Anda"
        // subtitle="Testimoni Anda sangat berarti untuk perkembangan kami"
        size="lg"
        // className="overflow-hidden"
      >
        <form onSubmit={handleSubmitTestimoni} className="space-y-6">
          {/* Rating Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900">
                  Seberapa puas Anda dengan hasil proyek ini?
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Berikan penilaian dari 1-5 bintang
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    star <= rating 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-yellow-200' // picked
                      : 'bg-gray-100 hover:bg-gray-200' //ketika tidak dipilih
                  }`}>
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'text-white'
                          : 'text-gray-300'
                      }`}
                      fill={star <= rating ? "white" : "none"}
                    />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <p className={`text-lg font-semibold transition-colors duration-300 ${
                rating === 5 ? 'text-green-600' :
                rating === 4 ? 'text-blue-600' :
                rating === 3 ? 'text-yellow-600' :
                rating === 2 ? 'text-orange-600' :
                rating === 1 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {rating === 5 && '⭐⭐⭐⭐⭐ Sangat Memuaskan!'}
                {rating === 4 && '⭐⭐⭐⭐ Puas'}
                {rating === 3 && '⭐⭐⭐ Cukup Baik'}
                {rating === 2 && '⭐⭐ Kurang Memuaskan'}
                {rating === 1 && '⭐ Tidak Puas'}
                {rating === 0 && 'Pilih rating Anda'}
              </p>
              {rating > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Terima kasih atas penilaian Anda!
                </p>
              )}
            </div>
          </div>

          {/* Komentar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-md">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
              </div>
              <label className="block text-base font-semibold text-gray-900">
                Komentar Anda <span className="text-red-500">*</span>
              </label>
            </div>
            
            <div className="relative">
              <Textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                placeholder="Ceritakan pengalaman Anda selama bekerja sama dengan kami"
                rows={5}
                required
                className="bg-white resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl p-4 text-gray-700 transition-all duration-300"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Testimoni Anda akan ditampilkan secara publik
                </p>
                <span className={`text-xs ${komentar.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {komentar.length}/500 karakter
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsTestimoniModalOpen(false)}
            disabled={isSubmitting}
            className="px-6 py-2.5
              border border-gray-300 
              text-gray-500 
              hover:text-red-700 
              hover:border-red-400 
              bg-white 
              hover:bg-white 
              transition-colors
              disabled:opacity-50 
              disabled:cursor-not-allowed"
          >
            Batal
          </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || rating === 0 || komentar.trim().length === 0}
              className="px-8 py-2.5 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mengirim...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Kirim Testimoni
                </div>
              )}
            </Button>
          </div>

          {/* Info Footer */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Dengan mengirim testimoni, Anda menyetujui testimoni ditampilkan di halaman publik kami.
            </p>
          </div>
        </form>
      </Modal>

    </div>
  )
}