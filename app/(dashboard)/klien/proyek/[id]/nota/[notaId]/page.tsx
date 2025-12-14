'use client'

import { useState, useEffect, use } from 'react'
import { getNotaByIdForKlien } from '@/lib/actions/klien/notaKlien'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { exportBahanToPDF, type NotaExportData } from '@/lib/utils/exportpdf'
import { 
  ArrowLeft, Calendar, Store, User, Package, 
  FileText, Loader2, Eye, ExternalLink,
  Download, Printer, Share2, 
  Receipt, ShoppingBag, CheckSquare,
  AlertCircle, CheckCircle, XCircle, Tag, Clock,
  DollarSign, Maximize2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/Badge' 

// --- Helper Functions ---
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id })
  } catch {
    return '-'
  }
}

const formatDateTime = (dateString: string | Date | null | undefined) => {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: id })
  } catch {
    return '-'
  }
}

export default function KlienNotaDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; notaId: string }> 
}) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [nota, setNota] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  
  const unwrappedParams = use(params)
  const projectId = unwrappedParams.id
  const notaId = unwrappedParams.notaId
  
  useEffect(() => {
    async function fetchNotaData() {
      try {
        setIsLoading(true)
        if (!notaId || sessionStatus === 'loading') return
        if (!session?.user) {
          setError('Akses ditolak')
          return
        }

        const result = await getNotaByIdForKlien(notaId)
        
        if (!result.success || !result.data) {
          setError(result.error || 'Data tidak ditemukan')
          return
        }
        
        setNota(result.data)
      } catch (err) {
        setError('Terjadi kesalahan sistem')
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotaData()
  }, [notaId, session, sessionStatus])

const handleExportPDF = async () => {
    if (!nota) return
    setIsExporting(true)
    const toastId = toast.loading('Menyiapkan dokumen PDF...')

    try {
      const dataToExport: NotaExportData[] = [{
        id: nota.id,
        nomorNota: nota.nomorNota,
        namaToko: nota.namaToko,
        tanggalBelanja: nota.tanggalBelanja,
        fotoNotaUrl: nota.fotoNotaUrl,
        createdAt: nota.createdAt,
        items: nota.items,
        milestone: nota.milestone,
        creator: nota.creator
      }]

      const exportStats = {
        totalItems: stats.totalItems,
        totalCost: stats.totalHarga,
        totalNota: 1
      }

      const projectName = nota.projek?.nama || 'Proyek Renovi'

      await exportBahanToPDF(projectName, dataToExport, exportStats)
      toast.success('PDF berhasil diunduh', { id: toastId })
    } catch (error) {
      console.error('Export PDF Error:', error)
      toast.error('Gagal membuat PDF', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  const handleViewImage = (url: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Calculate stats
  const calculateStats = () => {
    if (!nota?.items || !Array.isArray(nota.items)) {
      return { 
        totalHarga: 0, 
        totalItems: 0, 
        usedItems: 0, 
        remainingItems: 0, 
        damagedItems: 0 
      }
    }

    let totalHarga = 0
    let usedItems = 0
    let remainingItems = 0
    let damagedItems = 0

    nota.items.forEach((item: any) => {
      const harga = Number(item.harga) || 0
      const kuantitas = Number(item.kuantitas) || 0
      totalHarga += harga * kuantitas

      switch (item.status) {
        case 'Digunakan': usedItems++; break
        case 'Sisa': remainingItems++; break
        case 'Rusak': damagedItems++; break
      }
    })

    return { 
      totalHarga, 
      totalItems: nota.items.length, 
      usedItems, 
      remainingItems, 
      damagedItems 
    }
  }

  const stats = calculateStats()

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (error || !nota) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Data Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href={`/klien/proyek/${projectId}?tab=bahan`} className="text-blue-600 hover:underline">
          Kembali ke Proyek
        </Link>
      </div>
    )
  }

  function handleDownloadNota(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* 1. Header Simple & Clean */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/klien/proyek/${projectId}?tab=bahan`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none flex items-center gap-2">
                {nota.nomorNota || 'Detail Nota'}
                {nota.milestone && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                    {nota.milestone.nama}
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {formatDate(nota.tanggalBelanja)}
                <span className="text-gray-300">|</span>
                <Store className="w-3 h-3" /> {nota.namaToko || '-'}
              </p>
            </div>
          </div>
          
          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="hidden sm:flex items-center border border-gray-200 rounded-lg gap-2 px-3 py-1.5 text-black-700 text-xs font-medium"
              title="Print"
            >
              <Printer className="w-3 h-3" /> Cetak Laman
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="hidden sm:flex items-center bg-blue-600 border border-gray-200 rounded-lg gap-2 px-3 py-1.5 text-white text-xs font-medium"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
       {/* 2. Top Overview Cards - Improved Version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Financial Summary - Enhanced */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Header dengan gradient */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Total Pembelian</h3>
                <p className="text-xs text-gray-500 mt-0.5">Total belanja proyek</p>
              </div>
            </div>
            
            {/* Badge jika ada milestone */}
            {nota.milestone && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                {nota.milestone.nama}
              </span>
            )}
          </div>

          {/* Amount Display */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-gray-900 tracking-tight">{formatCurrency(stats.totalHarga)}</p>
            <div className="flex items-center gap-2 mt-2">
            </div>
          </div>

          {/* Stats Grid dengan icon */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            <div className="text-center p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-900">{stats.totalItems}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Total Items</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Barang dibeli</p>
            </div>
            
            <div className="text-center p-3 bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{stats.usedItems}</span>
              </div>
              <p className="text-xs text-green-700 font-medium">Terpakai</p>
              <p className="text-[10px] text-green-600 mt-0.5">Sudah digunakan</p>
            </div>
            
            <div className="text-center p-3 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{stats.remainingItems}</span>
              </div>
              <p className="text-xs text-blue-700 font-medium">Sisa</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Belum digunakan</p>
            </div>
          </div>

    {/* Additional Info jika ada yang rusak */}
    {stats.damagedItems > 0 && (
      <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">{stats.damagedItems} barang rusak</span>
          </div>
          <span className="text-xs text-red-500 font-medium">
            {stats.totalItems > 0 ? Math.round((stats.damagedItems / stats.totalItems) * 100) : 0}%
          </span>
        </div>
      </div>
    )}

    {/* Footer dengan tanggal */}
    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500">
          Tanggal: {formatDate(nota.tanggalBelanja)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Store className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500 truncate max-w-[120px]" title={nota.namaToko}>
          {nota.namaToko || 'Toko tidak diketahui'}
        </span>
      </div>
    </div>
  </div>
          {/* Right: Nota Evidence Preview */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                 <FileText className="w-4 h-4 text-gray-500" /> Bukti Fisik
               </h3>
               {nota.fotoNotaUrl && (
                 <button 
                   onClick={() => handleViewImage(nota.fotoNotaUrl)}
                   className="text-xs text-blue-600 hover:underline flex items-center gap-1 hover:text-blue-700 transition-colors"
                 >
                   <Maximize2 className="w-3 h-3" /> Lihat Penuh
                 </button>
               )}
             </div>
             
             {nota.fotoNotaUrl ? (
               <div 
                 className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-all duration-200"
                 onClick={() => handleViewImage(nota.fotoNotaUrl)}
               >
                 <div className="relative aspect-[3/4] max-h-64 mx-auto">
                   {/* Overlay untuk efek hover */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 z-10"></div>
                   
                   {/* Gambar dengan object-contain untuk menjaga kejelasan */}
                   <img 
                     src={nota.fotoNotaUrl} 
                     alt="Nota" 
                     className="absolute inset-0 w-full h-full object-contain p-2"
                   />
                   
                   {/* Icon zoom pada hover */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                     <div className="bg-black/70 p-2.5 rounded-full">
                       <Eye className="w-5 h-5 text-white" />
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="aspect-[3/4] max-h-64 w-full bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                 <FileText className="w-10 h-10 mb-3 opacity-50" />
                 <span className="text-sm">Tidak ada foto nota</span>
                 <span className="text-xs mt-1">Bukti fisik belum diunggah</span>
               </div>
             )}
          </div>
        </div>

        {/* 3. Main Content: Tabel Bahan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" /> Rincian Barang
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium w-1/3">Nama Barang</th>
                  <th className="px-6 py-3 font-medium text-right">Qty</th>
                  <th className="px-6 py-3 font-medium text-right">Harga Satuan</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nota.items.map((item: any) => {
                  const total = Number(item.harga) * Number(item.kuantitas)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.nama}</div>
                        {item.kategori && <div className="text-xs text-gray-400 mt-0.5 inline-flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">{item.kategori}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900">{item.kuantitas}</span> <span className="text-gray-400 text-xs">{item.satuan}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatCurrency(item.harga)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 bg-gray-50/30">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                          ${item.status === 'Digunakan' ? 'bg-green-50 text-green-700 border-green-100' : 
                            item.status === 'Sisa' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            'bg-red-50 text-red-700 border-red-100'}`}>
                          {item.status === 'Digunakan' && <CheckCircle className="w-3 h-3" />}
                          {item.status === 'Sisa' && <AlertCircle className="w-3 h-3" />}
                          {item.status === 'Rusak' && <XCircle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500 justify-between items-center">
            <div className="flex gap-4">
               <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dibuat: {nota.creator?.nama || '-'}</span>
               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDateTime(nota.createdAt)}</span>
            </div>
            <div>
               ID: {notaId}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function setIsExporting(arg0: boolean) {
  throw new Error('Function not implemented.')
}
