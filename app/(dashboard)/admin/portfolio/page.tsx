'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Eye, EyeOff, Search, Building2, Loader2, CheckCircle2, 
  AlertCircle, Briefcase, Calendar, User, Image as ImageIcon 
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
      if (result.success && result.data) {
        setItems(result.data as AdminPortfolioItem[])
      } else {
        toast.error('Gagal memuat data portfolio')
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan sistem')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <HeaderManajemenPortfolio />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Proyek</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Draft</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border border-gray-200 bg-white shadow-sm mb-6">
          <div className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari proyek atau nama klien..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data ditemukan</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Coba ubah kata kunci pencarian' 
                : 'Belum ada proyek selesai untuk portfolio'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.proyekId} 
                className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex flex-col h-full bg-white"
              >
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100">
                  {item.gambarProyek[0] ? (
                    <Image
                      src={item.gambarProyek[0]}
                      alt={item.proyekNama}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <span className="text-sm font-medium text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* Status Badge - Top Right */}
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant={item.isPublished ? 'success' : 'warning'} 
                      className="text-xs font-medium px-2 py-1"
                    >
                      {item.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </Badge>
                  </div>
                  
                  {/* Category Badge - Bottom Left */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="warning" className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1">
                      {item.proyekKategori}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-4 flex-grow flex flex-col">
                  {/* Project Title */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 leading-tight">
                      {item.proyekNama}
                    </h3>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-3 mb-4">
                    {/* Client Info */}
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Klien</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.clientNama}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date Info */}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Selesai</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(item.tanggalSelesai)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert */}
                  {!item.isCreated && (
                    <div className="mb-4 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>Portfolio belum dibuat</span>
                      </div>
                    </div>
                  )}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <Button 
                          onClick={() => handleToggle(item)}
                          disabled={actionLoading === item.proyekId}
                          variant={item.isPublished ? 'outline' : 'primary'}
                          className="w-full font-medium text-sm h-10 inline-flex items-center justify-center"
                        >
                          {actionLoading === item.proyekId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span>Processing...</span>
                            </>
                          ) : item.isPublished ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              <span>{item.isCreated ? 'Publish Now' : 'Create & Publish'}</span>
                            </>
                          )}
                        </Button>
                      </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}