// FILE: components/mandor/BahanHarianTab.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  DollarSign, 
  BarChart3, 
  Receipt,
  RefreshCw, 
  Eye,
  FileText,
  Download,
  ChevronDown,
  ShoppingCart,
  AlertCircle,
  Calendar,
  Store,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils/mandorUtils'
import Link from 'next/link'
import type { Project, Milestone } from './type'
import { NotaModal } from './modals/NotaModal'
import { exportBahanToPDF, NotaExportData } from '@/lib/utils/exportpdf'

// Interface untuk data Nota
interface NotaData {
  id: string
  nomorNota: string | null
  namaToko: string | null
  fotoNotaUrl: string
  tanggalBelanja: Date
  createdAt: Date
  updatedAt: Date
  proyekId: string
  milestoneId: string | null
  createdBy: string
  milestone: {
    id: string
    nama: string
  } | null
  creator: {
    id: string
    nama: string
  }
  items: Array<{
    id: string
    nama: string
    harga: string
    kuantitas: string
    satuan: string
    kategori: string | null
    status: string
  }>
}

interface BahanHarianTabProps {
  project: Project
  milestones: Milestone[]
}

export function BahanHarianTab({ project, milestones }: BahanHarianTabProps) {
  const [notaList, setNotaList] = useState<NotaData[]>([])
  const [loading, setLoading] = useState(false)
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [expandedNota, setExpandedNota] = useState<string | null>(null)
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Load nota data dari database
  const loadNotaData = async () => {
    setLoading(true)
    try {
      // Import action yang benar
      const { getNotaByProjectId } = await import('@/lib/actions/mandor/nota')
      const result = await getNotaByProjectId(project.id)
      
      if (result.success && result.data) {
        setNotaList(result.data)
      } else {
        toast.error(result.error || 'Gagal memuat data nota')
        setNotaList([])
      }
    } catch (error) {
      console.error('Error loading nota:', error)
      toast.error('Terjadi kesalahan saat memuat data')
      setNotaList([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const totalItems = notaList.reduce((sum, nota) => sum + nota.items.length, 0)
    
    const totalCost = notaList.reduce((sum, nota) => {
      return sum + nota.items.reduce((itemSum, item) => {
        return itemSum + (parseFloat(item.harga) * parseFloat(item.kuantitas))
      }, 0)
    }, 0)
    
    // Group by status
    const byStatus = notaList.reduce((acc: Record<string, number>, nota) => {
      // Anda bisa menambahkan logika status nota jika ada
      const status = 'active' // Default status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return { 
      totalNota: notaList.length, 
      totalItems, 
      totalCost,
      byStatus
    }
  }

  const stats = calculateStats()

  // Get unique months for filter
  const months = Array.from(new Set(
    notaList.map(nota => 
      new Date(nota.tanggalBelanja).toLocaleString('id-ID', { month: 'short', year: 'numeric' })
    )
  )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Filter nota by month
  const filteredNota = notaList.filter(nota => {
    if (filterMonth === 'all') return true
    const notaMonth = new Date(nota.tanggalBelanja).toLocaleString('id-ID', { month: 'short', year: 'numeric' })
    return notaMonth === filterMonth
  })

  // Load data on mount
  useEffect(() => {
    loadNotaData()
  }, [project.id])

  // Calculate total for a nota
  const calculateNotaTotal = (items: NotaData['items']) => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.harga) * parseFloat(item.kuantitas))
    }, 0)
  }

  // Modal handlers
  const handleOpenNotaModal = () => {
    setIsNotaModalOpen(true)
  }

  const handleCloseNotaModal = () => {
    setIsNotaModalOpen(false)
    // Refresh data after modal closes
    loadNotaData()
  }

  // Export handlers
const handleExportPDF = async () => {
  try {
    if (filteredNota.length === 0) {
      toast.error('Tidak ada data untuk di-export')
      return
    }

    toast.loading('Menyiapkan file PDF...')
    
    // Konversi filteredNota ke format NotaExportData
    const exportData: NotaExportData[] = filteredNota.map((nota) => ({
      id: nota.id,
      nomorNota: nota.nomorNota,
      namaToko: nota.namaToko,
      tanggalBelanja: nota.tanggalBelanja,
      fotoNotaUrl: nota.fotoNotaUrl,
      createdAt: nota.createdAt,
      items: nota.items,
      milestone: nota.milestone,
      creator: nota.creator
    }))

    // Hitung statistik
    const exportStats = {
      totalItems: exportData.reduce((sum, nota) => sum + nota.items.length, 0),
      totalCost: exportData.reduce((sum, nota) => {
        return sum + nota.items.reduce((itemSum, item) => {
          return itemSum + (parseFloat(item.harga) * parseFloat(item.kuantitas))
        }, 0)
      }, 0),
      totalNota: exportData.length
    }

    // Panggil fungsi export
    await exportBahanToPDF(
      project.nama,
      exportData,
      exportStats
    )
    
    toast.dismiss()
    toast.success('File PDF berhasil diunduh')
    
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    toast.dismiss()
    toast.error('Gagal mengekspor ke PDF')
  }
  setShowExportMenu(false)
}

// Untuk export Excel, tetap gunakan yang sebelumnya atau bisa buat fungsi serupa
const handleExportExcel = async () => {
  try {
    if (filteredNota.length === 0) {
      toast.error('Tidak ada data untuk di-export')
      return
    }

    toast.loading('Menyiapkan file Excel...')
    
    // Import library untuk generate Excel
    const XLSX = await import('xlsx')
    
    // Prepare data for Excel - Sederhanakan sesuai format yang Anda inginkan
    const excelData = filteredNota.flatMap((nota, notaIndex) => {
      return nota.items.map((item, itemIndex) => ({
        'No': itemIndex + 1,
        'Nomor Nota': nota.nomorNota || '-',
        'Toko': nota.namaToko || '-',
        'Tanggal Belanja': formatDate(nota.tanggalBelanja),
        'Milestone': nota.milestone?.nama || '-',
        'Nama Bahan': item.nama,
        'Kategori': item.kategori || '-',
        'Status': item.status,
        'Kuantitas': `${parseFloat(item.kuantitas).toFixed(2)} ${item.satuan}`,
        'Harga Satuan': formatCurrency(parseFloat(item.harga)),
        'Total': formatCurrency(parseFloat(item.harga) * parseFloat(item.kuantitas))
      }))
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const wscols = [
      { wch: 5 },    // No
      { wch: 15 },   // Nomor Nota
      { wch: 20 },   // Toko
      { wch: 15 },   // Tanggal Belanja
      { wch: 20 },   // Milestone
      { wch: 30 },   // Nama Bahan
      { wch: 15 },   // Kategori
      { wch: 12 },   // Status
      { wch: 15 },   // Kuantitas
      { wch: 15 },   // Harga Satuan
      { wch: 15 },   // Total
    ]
    ws['!cols'] = wscols

    // Add summary info
    const summaryInfo = [
      ['LAPORAN BAHAN PROYEK'],
      [`Proyek: ${project.nama}`],
      [`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`],
      [`Total Item: ${excelData.length}`],
      [`Total Biaya: ${formatCurrency(excelData.reduce((sum, row: any) => {
        // Extract numeric value from currency string
        const totalStr = row.Total || 'Rp 0'
        const numericValue = parseFloat(totalStr.replace(/[^\d]/g, '')) || 0
        return sum + numericValue
      }, 0))}`],
      [''], // Empty row
    ]

    // Add summary to worksheet
    XLSX.utils.sheet_add_aoa(ws, summaryInfo, { origin: -1 })
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Bahan Proyek')

    // Generate file name
    const fileName = `bahan-proyek-${project.nama.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`

    // Save the file
    XLSX.writeFile(wb, fileName)
    
    toast.dismiss()
    toast.success(`File Excel berhasil diunduh: ${fileName}`)
    
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    toast.dismiss()
    toast.error('Gagal mengekspor ke Excel')
  }
  setShowExportMenu(false)
}

  // Get status color for bahan item
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

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Card className="border border-blue-200 bg-blue-50/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">ℹ️ Sistem Nota Belanja</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Bahan harian dikelola melalui <strong>Nota Belanja</strong>. 
                Satu nota bisa berisi banyak barang. Klik "Tambah Nota Belanja" untuk input data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Nota</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold text-slate-900">{stats.totalNota}</p>
                  <span className="text-xs text-slate-400">nota</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Item</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold text-slate-900">{stats.totalItems}</p>
                  <span className="text-xs text-slate-400">item</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Biaya</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleOpenNotaModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all hover:shadow-md text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Tambah Nota Belanja</span>
        </Button>
        
        <div className="flex gap-2 flex-1">
          {/* Filter by Month */}
          {months.length > 0 && (
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-sm"
              >
                <option value="all">Semua Bulan</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            onClick={loadNotaData}
            className="px-3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline" 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              disabled={filteredNota.length === 0 || loading} 
              className="flex gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3"
            >
              <FileText className="w-4 h-4" />
              <ChevronDown className="w-4 h-4" />
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-lg z-10 py-1 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nota List */}
      {loading ? (
        <Card className="bg-white border border-slate-100 shadow-sm">
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-slate-500 text-sm">Memuat data nota...</p>
          </div>
        </Card>
      ) : filteredNota.length === 0 ? (
        <Card className="bg-white border border-slate-100 shadow-sm border-dashed">
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-900 font-semibold text-base mb-1">Belum ada data nota</p>
            <p className="text-slate-500 text-sm mb-4">
              {filterMonth === 'all' 
                ? 'Mulai dengan membuat nota belanja pertama Anda' 
                : `Tidak ada nota pada bulan ${filterMonth}`
              }
            </p>
            <Button
              onClick={handleOpenNotaModal}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Nota Pertama
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNota.map((nota) => {
            const isExpanded = expandedNota === nota.id
            const totalNota = calculateNotaTotal(nota.items)
            const notaMonth = new Date(nota.tanggalBelanja).toLocaleString('id-ID', { month: 'short', year: 'numeric' })

            return (
              <Card key={nota.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                {/* Nota Header - Simplified */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-5 h-5 text-blue-600" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Nomor Nota & Total */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {nota.nomorNota || 'Nota Tanpa Nomor'}
                          </h3>
                          <Badge variant="info" className="text-xs">
                            {notaMonth}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(totalNota)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {nota.items.length} item
                          </p>
                        </div>
                      </div>

                      {/* Middle Row: Details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                        {nota.namaToko && (
                          <span className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{nota.namaToko}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(nota.tanggalBelanja)}
                        </span>
                        {nota.milestone && (
                          <span className="text-purple-600 font-medium">
                            {nota.milestone.nama}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <div className="text-xs text-slate-500">
                          Dibuat oleh: {nota.creator.nama}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/mandor/proyek/${project.id}/nota/${nota.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setExpandedNota(isExpanded ? null : nota.id)
                            }}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <ChevronDown 
                              className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="space-y-3">
                        {nota.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-900">{item.nama}</h4>
                                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-600">
                                {item.kategori && (
                                  <span className="mr-3">Kategori: {item.kategori}</span>
                                )}
                                <span>Qty: {parseFloat(item.kuantitas).toFixed(2)} {item.satuan}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-emerald-600">
                                {formatCurrency(parseFloat(item.harga) * parseFloat(item.kuantitas))}
                              </div>
                              <div className="text-xs text-slate-500">
                                @ {formatCurrency(parseFloat(item.harga))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {filteredNota.length > 0 && (
        <Card className="bg-slate-50 border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-700">
                Menampilkan <span className="font-semibold">{filteredNota.length}</span> dari{' '}
                <span className="font-semibold">{notaList.length}</span> nota
                {filterMonth !== 'all' && ` pada bulan ${filterMonth}`}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600">
                  {formatCurrency(filteredNota.reduce((sum, nota) => sum + calculateNotaTotal(nota.items), 0))}
                </div>
                <div className="text-xs text-slate-500">Total nilai nota yang ditampilkan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal untuk buat nota baru */}
      <NotaModal
        isOpen={isNotaModalOpen}
        onClose={handleCloseNotaModal}
        proyekId={project.id}
        milestones={milestones}
      />
    </div>
  )
}