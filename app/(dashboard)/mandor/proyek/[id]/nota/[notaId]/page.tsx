// FILE: app/(dashboard)/mandor/proyek/[id]/nota/[notaId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getNotaById } from '@/lib/actions/mandor/nota'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Calendar, Store, User, Package, Tag, DollarSign, 
  Hash, FileText, Image as ImageIcon, Eye, Loader2 
} from 'lucide-react'
import { BahanDetailModal } from '@/components/mandor/modals/DetailBahan'

// Type untuk bahan
interface BahanType {
  id: string
  nama: string
  deskripsi?: string
  harga: number
  kuantitas: number
  satuan: string
  kategori?: string
  status: string
  gambar?: string[]
  createdAt?: string
  updatedAt?: string
}

export default function NotaDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; notaId: string }> 
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [nota, setNota] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // State untuk Detail Modal
  const [selectedBahan, setSelectedBahan] = useState<BahanType | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const { id: projectId, notaId } = await params
        
        console.log('🔍 Params:', { projectId, notaId })
        
        if (!notaId) {
          console.error('❌ notaId is missing!')
          notFound()
        }
        
        const result = await getNotaById(notaId)
        
        console.log('📦 Result:', result)
        
        if (!result.success || !result.data) {
          console.error('❌ Failed to fetch nota:', result.error)
          setError(result.error || 'Gagal memuat data nota')
          return
        }
        
        setNota(result.data)
      } catch (err) {
        console.error('Error fetching nota:', err)
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [params])

  // Fungsi untuk membuka modal detail
  const openBahanDetail = (bahan: BahanType) => {
    setSelectedBahan({
      ...bahan,
      nota: {
        namaToko: nota.namaToko,
        tanggalBelanja: nota.tanggalBelanja,
        nomorNota: nota.nomorNota
      },
      creator: nota.creator
    })
    setIsDetailModalOpen(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail nota...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !nota) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            href={`/mandor/proyek/${nota?.id || ''}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Proyek
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-4">{error || 'Data nota tidak ditemukan'}</p>
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/mandor/proyek/${nota.id || ''}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Proyek
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Detail Nota Belanja</h1>
              <p className="text-gray-600 mt-1">Nota #{nota.nomorNota}</p>
            </div>
            <div className="text-lg md:text-xl font-bold text-green-600">
              Rp {(nota.total_harga || 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
        
        {/* Info Nota Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Nama Toko</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 truncate">{nota.namaToko}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">Tanggal Belanja</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(nota.tanggalBelanja).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Jumlah Item</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {nota.jumlah_item || 0} item
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-orange-700 uppercase tracking-wider">Dibuat Oleh</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {nota.creator?.nama || '-'}
              </p>
            </div>
          </div>
          
          {/* Informasi Tambahan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-2">Dibuat pada</p>
              <p className="font-medium text-gray-900">
                {new Date(nota.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            {nota.milestone && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Milestone Terkait</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  {nota.milestone.nama}
                </div>
              </div>
            )}
          </div>
          
          {/* Foto Nota */}
          {nota.fotoNotaUrl && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Foto Nota</p>
              <div className="relative max-w-2xl mx-auto">
                <img 
                  src={nota.fotoNotaUrl} 
                  alt="Foto Nota" 
                  className="w-full rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Daftar Bahan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Daftar Bahan
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {nota.items?.length || 0} item bahan
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-600">Total Nota</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {(nota.total_harga || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          
          {nota.items && nota.items.length > 0 ? (
            <>
              {/* Desktop View - Table Layout */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          NO
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NAMA BAHAN
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KATEGORI
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          QTY
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HARGA SATUAN
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SUBTOTAL
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GAMBAR
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          AKSI
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STATUS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nota.items.map((item: any, index: number) => {
                        const subtotal = Number(item.harga) * Number(item.kuantitas)
                        
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <button
                                  onClick={() => openBahanDetail(item)}
                                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                                >
                                  {item.nama}
                                </button>
                                {item.deskripsi && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                                    {item.deskripsi}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.kategori ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {item.kategori}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">
                                  {item.kuantitas} {item.satuan}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-blue-600">
                                  Rp {Number(item.harga).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-green-600">
                                Rp {subtotal.toLocaleString('id-ID')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.gambar && item.gambar.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <img 
                                      src={item.gambar[0]} 
                                      alt={`${item.nama}`}
                                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                                      onClick={() => openBahanDetail(item)}
                                    />
                                    {item.gambar.length > 1 && (
                                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        +{item.gambar.length - 1}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => openBahanDetail(item)}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Lihat detail bahan"
                              >
                                <button 
                                  onClick={() => openBahanDetail(item)}
                                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                                  title="Lihat detail bahan"
                                >
                                  Lihat
                                </button>
                              
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === 'Digunakan' 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.status === 'Sisa' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Mobile & Tablet View - Card Layout */}
              <div className="lg:hidden space-y-4">
                {nota.items.map((item: any, index: number) => {
                  const subtotal = Number(item.harga) * Number(item.kuantitas)
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Gambar 1:1 (clickable) */}
                        <button 
                          onClick={() => openBahanDetail(item)}
                          className="flex-shrink-0"
                        >
                          {item.gambar && item.gambar.length > 0 ? (
                            <div className="relative">
                              <img 
                                src={item.gambar[0]} 
                                alt={`${item.nama}`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                              />
                              {item.gambar.length > 1 && (
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                                  +{item.gambar.length - 1}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </button>
                        
                        {/* Info Bahan */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <button
                                onClick={() => openBahanDetail(item)}
                                className="text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs font-semibold">
                                    {index + 1}
                                  </div>
                                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {item.nama}
                                  </h3>
                                </div>
                              </button>
                              
                              {item.kategori && (
                                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {item.kategori}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => openBahanDetail(item)}
                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Lihat detail"
                              >
                                <button 
                                  onClick={() => openBahanDetail(item)}
                                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                                  title="Lihat detail"
                                >
                                  Lihat
                                </button>
                              </button>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                                item.status === 'Digunakan' 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.status === 'Sisa' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          
                          {item.deskripsi && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600 flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                {item.deskripsi}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Detail Harga */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Qty</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.kuantitas} {item.satuan}
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-medium text-blue-600">Harga</span>
                          </div>
                          <p className="font-semibold text-blue-600 text-sm">
                            Rp {Number(item.harga).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-green-600">Subtotal</span>
                            <p className="font-bold text-green-600">
                              Rp {subtotal.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gallery jika ada lebih dari 1 gambar */}
                      {item.gambar && item.gambar.length > 1 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-2">Gallery ({item.gambar.length})</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {item.gambar.slice(1).map((img: string, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => openBahanDetail(item)}
                                className="relative flex-shrink-0"
                              >
                                <img 
                                  src={img} 
                                  alt={`${item.nama} ${idx + 2}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                                />
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded text-xs">
                                  {idx + 2}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Total Summary */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-center md:text-left">
                    <p className="text-gray-600">Total {nota.jumlah_item} item</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Update terakhir: {new Date(nota.updatedAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-600 mb-2">Total Keseluruhan</p>
                    <p className="text-3xl md:text-4xl font-bold text-green-600">
                      Rp {(nota.total_harga || 0).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center justify-center md:justify-end gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Digunakan
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Sisa
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Tidak Digunakan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada bahan</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Nota ini belum memiliki daftar bahan. Tambahkan bahan melalui halaman edit nota.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBahan && (
        <BahanDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          bahan={selectedBahan}
        />
      )}
    </div>
  )
}