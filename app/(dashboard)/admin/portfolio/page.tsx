'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Eye, EyeOff, Search, Building2, Loader2, CheckCircle2, 
  AlertCircle, Briefcase, Calendar, User, Image as ImageIcon,
  Edit, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { HeaderManajemenPortfolio } from '@/components/dashboard/HeaderDashboard'
import { getAdminPortfolios, togglePortfolioStatus } from '@/lib/actions/admin/portfolio'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { Portfolio } from '@/lib/db/schema'

interface AdminPortfolioItem {
  proyekId: string
  proyekNama: string
  proyekKategori: string
  clientNama: string
  tanggalSelesai: string | Date
  gambarProyek: string[]
  portfolioId: string | null
  isPublished: boolean
  isCreated: boolean
}

export default function ManajemenPortfolioPage() {
  const [items, setItems] = useState<AdminPortfolioItem[]>([])
    const [potfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await getAdminPortfolios()
      if (result.success && Array.isArray(result.data)) {
        setPortfolios(result.data as any)
      } else {
      setPortfolios([])
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (item: AdminPortfolioItem) => {
    try {
      setActionLoading(item.proyekId)
      const result = await togglePortfolioStatus(item.proyekId, item.isPublished)
      
      if (result.success) {
        toast.success(item.isPublished 
          ? 'Portfolio ditarik ke draft' 
          : 'Portfolio berhasil dipublikasikan'
        )
        await fetchData()
      } else {
        toast.error(result.error || 'Gagal update status')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.proyekNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientNama.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter(i => i.isPublished).length,
    draft: items.filter(i => !i.isPublished).length
  }), [items])

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        <HeaderManajemenPortfolio />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Proyek</p>
                <p className="text-3xl font-bold text-gray-600">{stats.published}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <Eye className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unpublished</p>
                <p className="text-3xl font-bold text-amber-600">{stats.draft}</p>
              </div>
              <EyeOff className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Search Bar */}
        <Card className="border-0 bg-white shadow-md mb-8 rounded-2xl">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Cari proyek atau nama klien..."
                className="pl-12 pr-4 bg-gray-50 border-gray-200 h-12 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-0 shadow-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tidak ada data ditemukan</h3>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian' 
                : 'Belum ada proyek selesai untuk portfolio'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.proyekId} 
                className="border-0 hover:shadow-2xl transition-all duration-300 flex flex-col h-full bg-white overflow-hidden rounded-2xl shadow-md group"
              >
                {/* Image Section - Lebih Besar */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {item.gambarProyek[0] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={item.gambarProyek[0]}
                        alt={item.proyekNama}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="p-6 rounded-full bg-white/80 backdrop-blur-sm mb-3 shadow-lg">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-500">No Image</span>
                    </div>
                  )}
                  
                  {/* Badges Container */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                    {/* Category Badge */}
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border-0">
                      {item.proyekKategori}
                    </Badge>
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border-0 ${
                        item.isPublished 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {/* Content Section - Lebih Rapi */}
                <CardContent className="p-6 flex-grow flex flex-col">
                  {/* Project Title - Lebih Besar */}
                  <h3 className="font-bold text-gray-900 text-xl mb-4 line-clamp-2 leading-snug">
                    {item.proyekNama}
                  </h3>

                  {/* Description - Jika ada, bisa ditambahkan */}
                  {item.proyekKategori && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {/* Placeholder untuk deskripsi jika ada */}
                    </p>
                  )}

                  {/* Info Section - Lebih Compact */}
                  <div className="space-y-3 mb-5">
                    {/* Client */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">KLIEN</p>
                        <p className="text-base font-bold text-gray-900 truncate">
                          {item.clientNama}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">SELESAI</p>
                        <p className="text-base font-bold text-gray-900">
                          {formatDate(item.tanggalSelesai)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert - Lebih Compact */}
                  {!item.isCreated && (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">Portfolio belum dibuat</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Seperti Referensi */}
                  <div className="mt-auto pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      {/* Author Info (Seperti referensi) */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Administrator Renovi</p>
                        <p className="text-xs text-gray-400">{formatDate(item.tanggalSelesai)}</p>
                      </div>
                    </div>
                    
                    {/* Main Action Button */}
                    <Button 
                      onClick={() => handleToggle(item)}
                      disabled={actionLoading === item.proyekId}
                      className={`w-full font-bold h-12 rounded-xl text-sm mt-4 transition-all shadow-md hover:shadow-lg border-0 ${
                        item.isPublished
                          ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {actionLoading === item.proyekId ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </span>
                      ) : item.isPublished ? (
                        <span className="flex items-center justify-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          <span>Unpublish Portfolio</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{item.isCreated ? 'Publish Now' : 'Create & Publish'}</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}