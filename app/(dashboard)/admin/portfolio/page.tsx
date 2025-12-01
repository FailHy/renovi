'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, ExternalLink, Search, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { HeaderManajemenPortfolio } from '@/components/dashboard/HeaderDashboard'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { publishPortfolio, getPortfolios } from '@/lib/actions/admin/portfolio' 
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

// Type untuk portfolio dari database
interface Portfolio {
  id: string
  proyekId: string
  name: string
  client: string
  location: string
  category: string
  duration: string
  completedDate: string
  description: string
  imageUrl: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  proyek: {
    nama: string
    status: string
    pelanggan: {
      nama: string
    }
  }
}

export default function ManajemenPortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublished, setFilterPublished] = useState<string>('')
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [actionPortfolio, setActionPortfolio] = useState<Portfolio | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch data portfolio dari database menggunakan Server Action
  useEffect(() => {
    fetchPortfolios()
  }, [])

  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      
      // ✅ Gunakan Server Action langsung
      const result = await getPortfolios()
      
      if (result.success && result.data) {
        setPortfolios(result.data)
      } else {
        console.error('Gagal memuat portfolio:', result.error)
        setPortfolios([])
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error)
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPortfolios = portfolios.filter((portfolio) => {
    const matchSearch =
      portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchPublished =
      filterPublished === ''
        ? true
        : filterPublished === 'published'
        ? portfolio.published
        : !portfolio.published

    return matchSearch && matchPublished
  })

  const handleViewDetail = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setIsDetailModalOpen(true)
  }

  const handleTogglePublish = (portfolio: Portfolio) => {
    setActionPortfolio(portfolio)
    setIsConfirmModalOpen(true)
  }

  const confirmTogglePublish = async () => {
    if (!actionPortfolio) return

    try {
      setActionLoading(true)
      
      // ✅ Gunakan fungsi publishPortfolio dari actions
      const result = await publishPortfolio(actionPortfolio.id, !actionPortfolio.published)
      
      if (result.success) {
        // Update local state
        setPortfolios(portfolios.map(p =>
          p.id === actionPortfolio.id 
            ? { ...p, published: !actionPortfolio.published }
            : p
        ))
        
        // Jika portfolio yang sedang dilihat di modal di-update, update juga state-nya
        if (selectedPortfolio?.id === actionPortfolio.id) {
          setSelectedPortfolio({
            ...selectedPortfolio,
            published: !actionPortfolio.published
          })
        }
        
        alert(
          `Portfolio berhasil ${!actionPortfolio.published ? 'dipublikasikan' : 'disembunyikan'}!`
        )
      } else {
        alert(result.error || 'Gagal mengupdate status portfolio')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat mengupdate portfolio')
    } finally {
      setActionLoading(false)
      setIsConfirmModalOpen(false)
      setActionPortfolio(null)
    }
  }

  const getPublishedStats = () => {
    const published = portfolios.filter((p) => p.published).length
    const unpublished = portfolios.filter((p) => !p.published).length
    return { published, unpublished, total: portfolios.length }
  }

  const stats = getPublishedStats()

  return (
    <div>
      <HeaderManajemenPortfolio />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Portfolio
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Published
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.published}
                </p>
              </div>
              <Eye className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Unpublished
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.unpublished}
                </p>
              </div>
              <EyeOff className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama portfolio, klien, atau kategori..."
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Grid */}
      {loading ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="mt-3 text-gray-600 font-medium">Memuat data portfolio...</p>
          </CardContent>
        </Card>
      ) : filteredPortfolios.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-16">
            <Building2 className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm || filterPublished
                ? 'Tidak ada portfolio yang ditemukan'
                : 'Belum ada portfolio'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || filterPublished
                ? 'Coba ubah kata kunci pencarian atau filter status'
                : 'Portfolio akan muncul di sini setelah proyek selesai dan ditambahkan ke portfolio'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
              <div className="relative">
                {/* Image */}
                <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                  {portfolio.imageUrl?.[0] ? (
                    <img
                      src={portfolio.imageUrl[0]}
                      alt={portfolio.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={portfolio.published ? 'success' : 'warning'}
                    className="text-xs px-2 py-1 font-medium"
                  >
                    {portfolio.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                  {portfolio.name}
                </h3>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Klien:
                    </span>
                    <span className="font-medium text-gray-900">{portfolio.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Kategori:
                    </span>
                    <span className="text-gray-900">{portfolio.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Lokasi:
                    </span>
                    <span className="text-gray-900">{portfolio.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Selesai:
                    </span>
                    <span className="text-gray-900">{formatDate(portfolio.completedDate)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {portfolio.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetail(portfolio)}
                    className="flex-1 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Detail
                  </Button>
                  <Button
                    variant={portfolio.published ? "outline" : "primary"}
                    onClick={() => handleTogglePublish(portfolio)}
                    className="flex-1 text-sm"
                    disabled={actionLoading}
                  >
                    {portfolio.published ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Sembunyikan
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Publikasikan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Portfolio"
        size="xl"
      >
        {selectedPortfolio && (
          <div className="space-y-6">
            {/* Images Gallery */}
            {selectedPortfolio.imageUrl && selectedPortfolio.imageUrl.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {selectedPortfolio.imageUrl.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`${selectedPortfolio.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nama Portfolio
                </label>
                <p className="mt-1 font-semibold text-gray-900">{selectedPortfolio.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Klien
                </label>
                <p className="mt-1 text-gray-900">{selectedPortfolio.client}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Kategori
                </label>
                <p className="mt-1 text-gray-900">{selectedPortfolio.category}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Lokasi
                </label>
                <p className="mt-1 text-gray-900">{selectedPortfolio.location}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Durasi
                </label>
                <p className="mt-1 text-gray-900">{selectedPortfolio.duration}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tanggal Selesai
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(selectedPortfolio.completedDate)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={selectedPortfolio.published ? 'success' : 'warning'}
                    className="text-xs px-2 py-1 font-medium"
                  >
                    {selectedPortfolio.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Deskripsi
              </label>
              <p className="mt-1 text-gray-900 leading-relaxed">{selectedPortfolio.description}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Link
                href={`/portfolio/${selectedPortfolio.id}`}
                target="_blank"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Lihat di Halaman Publik →
              </Link>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Tutup
                </Button>
                <Button 
                  onClick={() => handleTogglePublish(selectedPortfolio)}
                  disabled={actionLoading}
                  className={selectedPortfolio.published ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedPortfolio.published ? (
                    'Sembunyikan'
                  ) : (
                    'Publikasikan'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin{' '}
            <strong>
              {actionPortfolio?.published ? 'menyembunyikan' : 'mempublikasikan'}
            </strong>{' '}
            portfolio <strong className="text-blue-600">{actionPortfolio?.name}</strong>?
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button 
              onClick={confirmTogglePublish}
              disabled={actionLoading}
              className={actionPortfolio?.published ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                `Ya, ${actionPortfolio?.published ? 'Sembunyikan' : 'Publikasikan'}`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}