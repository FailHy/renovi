'use client'

import { useState } from 'react'
import { Eye, EyeOff, ExternalLink, Search, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { publishPortfolio } from '@/lib/actions/portfolio'
import { formatDate, cn } from '@/lib/utils'
import Link from 'next/link'

// Mock data - replace dengan data dari API
const mockPortfolios = [
  {
    id: '1',
    proyekId: 'proj-1',
    name: 'Renovasi Dapur & Kamar Mandi Minimalis',
    client: 'Dewi Lestari',
    location: 'Pekanbaru, Riau',
    category: 'Renovasi Rumah',
    duration: '1.5 Bulan',
    completedDate: '2024-02-20',
    description: 'Transformasi total dapur dan kamar mandi dengan konsep minimalis modern. Menggunakan material berkualitas tinggi dan desain yang fungsional.',
    imageUrl: ['/images/portfolio/dapur-1.jpg', '/images/portfolio/dapur-2.jpg'],
    published: true,
    createdAt: '2024-02-21',
    proyek: {
      nama: 'Renovasi Dapur & Kamar Mandi',
      status: 'Selesai',
      pelanggan: { nama: 'Dewi Lestari' },
    },
  },
  {
    id: '2',
    proyekId: 'proj-2',
    name: 'Landscaping Taman Minimalis Tropis',
    client: 'Dewi Lestari',
    location: 'Pekanbaru, Riau',
    category: 'Landscaping',
    duration: '1.5 Bulan',
    completedDate: '2023-12-15',
    description: 'Penataan taman dengan konsep minimalis tropis yang memadukan elemen modern dan natural. Dilengkapi dengan vertical garden dan water feature.',
    imageUrl: ['/images/portfolio/taman-1.jpg', '/images/portfolio/taman-2.jpg'],
    published: false,
    createdAt: '2023-12-16',
    proyek: {
      nama: 'Landscaping Taman',
      status: 'Selesai',
      pelanggan: { nama: 'Dewi Lestari' },
    },
  },
]

export default function ManajemenPortfolioPage() {
  const [portfolios, setPortfolios] = useState(mockPortfolios)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublished, setFilterPublished] = useState<string>('')
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [actionPortfolio, setActionPortfolio] = useState<any>(null)

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

  const handleViewDetail = (portfolio: any) => {
    setSelectedPortfolio(portfolio)
    setIsDetailModalOpen(true)
  }

  const handleTogglePublish = (portfolio: any) => {
    setActionPortfolio(portfolio)
    setIsConfirmModalOpen(true)
  }

  const confirmTogglePublish = async () => {
    try {
      const newStatus = !actionPortfolio.published
      
      // Update di state
      setPortfolios(
        portfolios.map((p) =>
          p.id === actionPortfolio.id ? { ...p, published: newStatus } : p
        )
      )

      alert(
        `Portfolio berhasil ${newStatus ? 'dipublikasikan' : 'disembunyikan'}!`
      )
      setIsConfirmModalOpen(false)
      setActionPortfolio(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan!')
    }
  }

  const getPublishedStats = () => {
    const published = portfolios.filter((p) => p.published).length
    const unpublished = portfolios.filter((p) => !p.published).length
    return { published, unpublished }
  }

  const stats = getPublishedStats()

  return (
    <div>
      <DashboardHeader
        title="Manajemen Portfolio"
        description="Kelola portfolio proyek yang telah selesai"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Portfolio
                </p>
                <p className="text-3xl font-bold text-foreground">{portfolios.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
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
                <p className="text-sm text-muted-foreground mb-1">
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
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama portfolio, klien, atau kategori..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'published', label: 'Published' },
                { value: 'unpublished', label: 'Unpublished' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Grid */}
      {filteredPortfolios.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm || filterPublished
                ? 'Tidak ada portfolio yang ditemukan'
                : 'Belum ada portfolio'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Image */}
                <div className="aspect-video bg-muted rounded-t-xl overflow-hidden">
                  {portfolio.imageUrl?.[0] ? (
                    <img
                      src={portfolio.imageUrl[0]}
                      alt={portfolio.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={portfolio.published ? 'success' : 'warning'}
                    className="text-xs px-2 py-1 bg-opacity-20 border-opacity-50"
                  >
                    {portfolio.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
                  {portfolio.name}
                </h3>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Klien:
                    </span>
                    <span className="font-medium text-foreground">{portfolio.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Kategori:
                    </span>
                    <span className="text-foreground">{portfolio.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Lokasi:
                    </span>
                    <span className="text-foreground">{portfolio.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Selesai:
                    </span>
                    <span className="text-foreground">{formatDate(portfolio.completedDate)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {portfolio.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetail(portfolio)}
                    className="flex-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Detail
                  </Button>
                  <Button
                    variant={portfolio.published ? "outline" : "primary"}
                    onClick={() => handleTogglePublish(portfolio)}
                    className="flex-1 text-sm"
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
                    className="aspect-video bg-muted rounded-lg overflow-hidden"
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
                <label className="text-sm font-medium text-muted-foreground">
                  Nama Portfolio
                </label>
                <p className="mt-1 font-semibold text-foreground">{selectedPortfolio.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Klien
                </label>
                <p className="mt-1 text-foreground">{selectedPortfolio.client}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kategori
                </label>
                <p className="mt-1 text-foreground">{selectedPortfolio.category}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Lokasi
                </label>
                <p className="mt-1 text-foreground">{selectedPortfolio.location}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Durasi
                </label>
                <p className="mt-1 text-foreground">{selectedPortfolio.duration}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tanggal Selesai
                </label>
                <p className="mt-1 text-foreground">
                  {formatDate(selectedPortfolio.completedDate)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={selectedPortfolio.published ? 'success' : 'warning'}
                    className="text-xs px-2 py-1 bg-opacity-20 border-opacity-50"
                  >
                    {selectedPortfolio.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Deskripsi
              </label>
              <p className="mt-1 text-foreground">{selectedPortfolio.description}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Link
                href={`/portfolio/${selectedPortfolio.id}`}
                target="_blank"
                className="text-primary hover:underline text-sm"
              >
                Lihat di Halaman Publik →
              </Link>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Tutup
                </Button>
                <Button onClick={() => handleTogglePublish(selectedPortfolio)}>
                  {selectedPortfolio.published ? 'Sembunyikan' : 'Publikasikan'}
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
        <p className="mb-6 text-foreground">
          Apakah Anda yakin ingin{' '}
          <strong>
            {actionPortfolio?.published ? 'menyembunyikan' : 'mempublikasikan'}
          </strong>{' '}
          portfolio <strong>{actionPortfolio?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsConfirmModalOpen(false)}
          >
            Batal
          </Button>
          <Button onClick={confirmTogglePublish}>
            Ya, {actionPortfolio?.published ? 'Sembunyikan' : 'Publikasikan'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}