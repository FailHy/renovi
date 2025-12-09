// FILE: components/mandor/BahanHarianTab.tsx - VERSI DIPERBAIKI
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils/mandorUtils'
import { NotaModal } from './modals/NotaModal'
import type { Project, Milestone } from './type'

interface BahanHarianTabProps {
  project: Project
  milestones: Milestone[]
}

interface BahanWithNota {
  id: string
  nama: string
  deskripsi: string | null
  harga: string // decimal as string
  kuantitas: string // decimal as string
  satuan: string
  kategori: string | null
  status: string
  gambar: string[] | null
  createdAt: Date
  notaId: string
  nota: {
    id: string
    nomorNota: string | null
    namaToko: string | null
    tanggalBelanja: Date
    status: string
    fotoNotaUrl: string
  }
  milestone: {
    id: string
    nama: string
  } | null
}

interface BahanStats {
  totalItems: number
  totalCost: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  byNotaStatus: Record<string, number>
}

export function BahanHarianTab({ project, milestones }: BahanHarianTabProps) {
  const [bahanList, setBahanList] = useState<BahanWithNota[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterNotaStatus, setFilterNotaStatus] = useState<string>('all')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [expandedNota, setExpandedNota] = useState<string | null>(null)
  
  // Modal state hanya untuk buat nota baru
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false)

  // Load bahan data
  const loadBahanData = async () => {
    setLoading(true)
    try {
      const { getBahanByProject } = await import('@/lib/actions/mandor/bahan')
      const result = await getBahanByProject(project.id, project.mandorId!)
      
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

  // Calculate statistics
  const calculateStats = (): BahanStats => {
    const totalCost = bahanList.reduce((sum, item) => {
      return sum + (parseFloat(item.harga) * parseFloat(item.kuantitas))
    }, 0)
    
    const totalItems = bahanList.length
    
    const byStatus = bahanList.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})

    const byCategory = bahanList.reduce((acc: Record<string, number>, item) => {
      const kategori = item.kategori || 'Lainnya'
      acc[kategori] = (acc[kategori] || 0) + 1
      return acc
    }, {})

    const byNotaStatus = bahanList.reduce((acc: Record<string, number>, item) => {
      acc[item.nota.status] = (acc[item.nota.status] || 0) + 1
      return acc
    }, {})

    return { totalCost, totalItems, byStatus, byCategory, byNotaStatus }
  }

  const stats = calculateStats()

  // Filter bahan
  const filteredBahan = bahanList.filter(item => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus
    const matchNotaStatus = filterNotaStatus === 'all' || item.nota.status === filterNotaStatus
    return matchStatus && matchNotaStatus
  })

  // Group bahan by nota
  const bahanByNota = filteredBahan.reduce((acc: Record<string, BahanWithNota[]>, item) => {
    const notaId = item.notaId
    if (!acc[notaId]) {
      acc[notaId] = []
    }
    acc[notaId].push(item)
    return acc
  }, {})

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

  const getNotaStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Export handlers (simplified - just show data)
  const handleExportPDF = async () => {
    toast('Export PDF akan segera tersedia')
    setShowExportMenu(false)
  }

  const handleExportExcel = async () => {
    toast('Export Excel akan segera tersedia')
    setShowExportMenu(false)
  }

  // Modal handlers
  const handleOpenNotaModal = () => {
    setIsNotaModalOpen(true)
  }

  const handleCloseNotaModal = () => {
    setIsNotaModalOpen(false)
    // Refresh data after modal closes
    loadBahanData()
  }

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
                <p className="text-xl lg:text-2xl font-bold text-slate-900">
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
                      {status}: {count}
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
          onClick={handleOpenNotaModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Tambah Nota Belanja</span>
        </Button>
        
        <div className="flex gap-2 flex-1">

          <Button
            variant="outline"
            onClick={loadBahanData}
            className="flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={filteredBahan.length === 0 || loading}
              className="flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4"
            >
              <FileText className="w-4 h-4" />
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

      {/* Bahan List - Grouped by Nota */}
      {loading ? (
        <Card className="bg-white border-0 shadow-md">
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 font-medium">Memuat data bahan...</p>
          </div>
        </Card>
      ) : filteredBahan.length === 0 ? (
        <Card className="bg-white border-0 shadow-md">
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-900 font-bold text-lg mb-2">
              {filterStatus === 'all' && filterNotaStatus === 'all'
                ? 'Belum ada data bahan' 
                : 'Tidak ada bahan yang sesuai filter'
              }
            </p>
            <p className="text-slate-600 mb-4">
              Tambahkan nota belanja untuk mencatat bahan yang digunakan
            </p>
            {(filterStatus !== 'all' || filterNotaStatus !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterStatus('all')
                  setFilterNotaStatus('all')
                }}
                className="text-sm mt-2 text-blue-600 hover:text-blue-700"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(bahanByNota).map(([notaId, items]) => {
            const nota = items[0].nota
            const isExpanded = expandedNota === notaId
            const totalNota = items.reduce((sum, item) => 
              sum + (parseFloat(item.harga) * parseFloat(item.kuantitas)), 0
            )

            return (
              <Card key={notaId} className="bg-white border-0 shadow-md overflow-hidden">
                {/* Nota Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
                  <div className="flex items-center justify-between gap-4">
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setExpandedNota(isExpanded ? null : notaId)}
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 truncate">
                            {nota.nomorNota || 'Nota Tanpa Nomor'}
                          </h3>
                          <Badge className={`text-xs font-semibold ${getNotaStatusColor(nota.status)}`}>
                            {nota.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          {nota.namaToko && (
                            <span className="truncate">📍 {nota.namaToko}</span>
                          )}
                          <span>📅 {formatDate(nota.tanggalBelanja)}</span>
                          <span className="font-semibold">
                            {items.length} item
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-600">Total</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {formatCurrency(totalNota)}
                        </p>
                      </div>
                      {/* LINK KE HALAMAN DETAIL NOTA */}
                      <Link href={`/mandor/proyek/${project.id}/nota/${notaId}`}>
                        <Button
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Detail</span>
                        </Button>
                      </Link>
                      <button
                        onClick={() => setExpandedNota(isExpanded ? null : notaId)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <ChevronDown 
                          className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bahan Items (Expandable) */}
                {isExpanded && (
                  <div className="divide-y divide-slate-200">
                    {items.map((bahan) => (
                      <div key={bahan.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 mb-1">
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
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-xs text-slate-500 block">Kuantitas</span>
                                <span className="font-semibold text-slate-900">
                                  {parseFloat(bahan.kuantitas).toFixed(2)} {bahan.satuan}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500 block">Harga</span>
                                <span className="font-semibold text-slate-900">
                                  {formatCurrency(parseFloat(bahan.harga))}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500 block">Subtotal</span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(parseFloat(bahan.harga) * parseFloat(bahan.kuantitas))}
                                </span>
                              </div>
                              {bahan.kategori && (
                                <div>
                                  <span className="text-xs text-slate-500 block">Kategori</span>
                                  <span className="font-semibold text-slate-900">
                                    {bahan.kategori}
                                  </span>
                                </div>
                              )}
                            </div>

                            {bahan.milestone && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
                                  🏗️ {bahan.milestone.nama}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Gambar */}
                          {bahan.gambar && bahan.gambar.length > 0 && (
                            <div className="flex gap-2">
                              {bahan.gambar.slice(0, 2).map((img, idx) => (
                                <a
                                  key={idx}
                                  href={img}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-16 h-16 rounded-lg border-2 border-slate-200 overflow-hidden hover:border-blue-500 transition-all flex-shrink-0"
                                >
                                  <img 
                                    src={img} 
                                    alt={`Gambar ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              ))}
                              {bahan.gambar.length > 2 && (
                                <div className="w-16 h-16 rounded-lg border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                  +{bahan.gambar.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal untuk buat nota baru */}
      <NotaModal
        isOpen={isNotaModalOpen}
        onClose={handleCloseNotaModal}
        proyekId={project.id}
      />
    </div>
  )
}