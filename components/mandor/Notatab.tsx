// FILE: components/mandor/NotaTab.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Receipt, Plus, Eye, FileText, Calendar, Package } from 'lucide-react'
import { NotaModal } from './modals/NotaModal'
import { getNotaByProjectId } from '@/lib/actions/mandor/nota'

interface NotaTabProps {
  proyekId: string
  initialNotaData?: Array<{
    id: string
    nomorNota?: string
    namaToko: string
    fotoNotaUrl: string
    tanggalBelanja: string
    status: 'draft' | 'pending' | 'approved' | 'rejected'
    total_harga?: number
    items?: Array<{
      id: string
      nama: string
      harga: number
      kuantitas: number
      satuan: string
    }>
  }>
}

export function NotaTab({ proyekId, initialNotaData = [] }: NotaTabProps) {
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false)
  const [notaData, setNotaData] = useState(initialNotaData)
  const [isLoading, setIsLoading] = useState(false)

  // Fungsi untuk refresh data nota
  const refreshNotaData = async () => {
    setIsLoading(true)
    try {
      const result = await getNotaByProjectId(proyekId)
      if (result.success) {
        setNotaData(result.data)
      }
    } catch (error) {
      console.error('Error refreshing nota data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group nota by status
  const draftNota = notaData.filter(n => n.status === 'draft')
  const pendingNota = notaData.filter(n => n.status === 'pending')
  const approvedNota = notaData.filter(n => n.status === 'approved')
  const rejectedNota = notaData.filter(n => n.status === 'rejected')

  // Calculate statistics
  const totalNota = notaData.length
  const totalPengeluaran = notaData.reduce((sum, nota) => {
    const notaTotal = nota.items?.reduce((itemSum, item) => 
      itemSum + (Number(item.harga) * Number(item.kuantitas)), 0
    ) || 0
    return sum + notaTotal
  }, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui'
      case 'pending': return 'Menunggu'
      case 'rejected': return 'Ditolak'
      default: return 'Draft'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Nota</p>
                <p className="text-2xl font-bold">{totalNota}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disetujui</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedNota.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingNota.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalPengeluaran)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Daftar Nota</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshNotaData}
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Refresh'}
          </Button>
          <Button onClick={() => setIsNotaModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Nota Baru
          </Button>
        </div>
      </div>

      {/* Draft Nota */}
      {draftNota.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Draft Nota</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftNota.map((nota) => (
              <NotaCard 
                key={nota.id}
                nota={nota}
                proyekId={proyekId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Nota */}
      {approvedNota.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nota Disetujui</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedNota.map((nota) => (
              <NotaCard 
                key={nota.id}
                nota={nota}
                proyekId={proyekId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Nota */}
      {pendingNota.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Menunggu Persetujuan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingNota.map((nota) => (
              <NotaCard 
                key={nota.id}
                nota={nota}
                proyekId={proyekId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Nota */}
      {rejectedNota.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nota Ditolak</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedNota.map((nota) => (
              <NotaCard 
                key={nota.id}
                nota={nota}
                proyekId={proyekId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notaData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada nota</h3>
          <p className="text-gray-600 mb-4">Mulai dengan membuat nota pertama Anda</p>
          <Button onClick={() => setIsNotaModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Nota Baru
          </Button>
        </div>
      )}

      {/* Modals */}
      <NotaModal
        isOpen={isNotaModalOpen}
        onClose={() => {
          setIsNotaModalOpen(false)
          refreshNotaData() // Refresh data setelah membuat nota baru
        }}
        proyekId={proyekId}
      />
    </div>
  )
}

// Komponen terpisah untuk Nota Card
function NotaCard({ nota, proyekId }: { nota: any, proyekId: string }) {
  const totalHarga = nota.items?.reduce((sum: number, item: any) => 
    sum + (Number(item.harga) * Number(item.kuantitas)), 0
  ) || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui'
      case 'pending': return 'Menunggu'
      case 'rejected': return 'Ditolak'
      default: return 'Draft'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(nota.status)}`}>
                {getStatusText(nota.status)}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 truncate">{nota.namaToko}</h3>
            {nota.nomorNota && (
              <p className="text-xs text-gray-500 mb-2">No: {nota.nomorNota}</p>
            )}
          </div>
        </div>

        {/* Nota Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tanggal:</span>
            <span className="font-medium">
              {new Date(nota.tanggalBelanja).toLocaleDateString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Item:</span>
            <span className="font-medium">{nota.items?.length || 0} item</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Harga:</span>
            <span className="font-bold text-green-600">
              {formatCurrency(totalHarga)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/mandor/proyek/${proyekId}/nota/${nota.id}`}>
          <Button variant="outline" className="w-full">
            <Eye className="w-4 h-4 mr-1" />
            Lihat Detail
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}