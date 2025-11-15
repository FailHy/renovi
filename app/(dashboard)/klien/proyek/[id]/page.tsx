// FILE: app/(dashboard)/klien/proyek/[id]/page.tsx
// ========================================
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, MapPin, User, Phone, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { formatDate, formatCurrency } from '@/lib/utils'

// Mock data
const mockProject = {
  id: '1',
  nama: 'Renovasi Rumah Pak Budi',
  tipeLayanan: 'Renovasi Rumah',
  deskripsi: 'Renovasi total bagian dapur dan kamar mandi',
  alamat: 'Jl. Sudirman No. 123, Pekanbaru',
  status: 'Selesai',
  progress: 100,
  mulai: '2024-01-01',
  selesai: '2024-02-15',
  mandor: {
    nama: 'Ahmad Mandor',
    telpon: '08123456789',
  },
  hasTestimoni: false,
}

const mockMilestones = [
  {
    id: '1',
    nama: 'Pembongkaran Dapur Lama',
    deskripsi: 'Membongkar keramik dan kabinet lama',
    status: 'Selesai',
    tanggal: '2024-01-05',
  },
  {
    id: '2',
    nama: 'Pemasangan Keramik Baru',
    deskripsi: 'Memasang keramik lantai dan dinding',
    status: 'Selesai',
    tanggal: '2024-01-20',
  },
]

const mockBahan = [
  {
    id: '1',
    nama: 'Keramik Lantai',
    kuantitas: 50,
    satuan: 'meter',
    harga: 150000,
    status: 'Digunakan',
    tanggal: '2024-01-10',
  },
  {
    id: '2',
    nama: 'Semen',
    kuantitas: 20,
    satuan: 'sak',
    harga: 60000,
    status: 'Digunakan',
    tanggal: '2024-01-08',
  },
]

export default function DetailProyekKlienPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'info' | 'milestone' | 'bahan'>('info')
  const [isTestimoniModalOpen, setIsTestimoniModalOpen] = useState(false)
  const [rating, setRating] = useState(5)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Perencanaan': 'info',
      'Dalam Progress': 'warning',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
      'Belum Dimulai': 'info',
      'Digunakan': 'success',
      'Sisa': 'warning',
      'Rusak': 'danger',
    }
    return variants[status] || 'info'
  }

  const handleSubmitTestimoni = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit testimoni with rating:', rating)
    setIsTestimoniModalOpen(false)
  }

  return (
    <div>
      <DashboardHeader
        title={mockProject.nama}
        description={mockProject.tipeLayanan}
        action={
          mockProject.status === 'Selesai' && !mockProject.hasTestimoni ? (
            <Button onClick={() => setIsTestimoniModalOpen(true)}>
              Berikan Testimoni
            </Button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          Informasi Proyek
        </button>
        <button
          onClick={() => setActiveTab('milestone')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'milestone'
              ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          Milestone
        </button>
        <button
          onClick={() => setActiveTab('bahan')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'bahan'
              ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
              : 'border-transparent text-gray-600 dark:text-gray-400'
          }`}
        >
          Bahan Material
        </button>
      </div>

      {/* Tab Content: Info */}
      {activeTab === 'info' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Proyek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant={getStatusBadge(mockProject.status)}>
                  {mockProject.status}
                </Badge>
              </div>

              <div>
                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Progress
                </label>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{mockProject.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-light-primary dark:bg-dark-primary"
                      style={{ width: `${mockProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Deskripsi
                </label>
                <p className="mt-1">{mockProject.deskripsi}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                <div>
                  <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Lokasi
                  </label>
                  <p className="mt-1">{mockProject.alamat}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                  <div>
                    <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Mulai
                    </label>
                    <p className="mt-1">{formatDate(mockProject.mulai)}</p>
                  </div>
                </div>
                {mockProject.selesai && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                    <div>
                      <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Selesai
                      </label>
                      <p className="mt-1">{formatDate(mockProject.selesai)}</p>
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
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                <div>
                  <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Nama Mandor
                  </label>
                  <p className="mt-1 font-medium">{mockProject.mandor.nama}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                <div>
                  <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Nomor Telepon
                  </label>
                  <p className="mt-1">{mockProject.mandor.telpon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Milestone */}
      {activeTab === 'milestone' && (
        <div className="space-y-4">
          {mockMilestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{milestone.nama}</h4>
                      <Badge variant={getStatusBadge(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
                      {milestone.deskripsi}
                    </p>
                    <p className="text-sm">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">
                        Tanggal:
                      </span>
                      <span className="ml-2 font-medium">{formatDate(milestone.tanggal)}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Content: Bahan */}
      {activeTab === 'bahan' && (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Bahan</th>
                    <th>Kuantitas</th>
                    <th>Harga Satuan</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBahan.map((bahan) => (
                    <tr key={bahan.id}>
                      <td className="font-medium">{bahan.nama}</td>
                      <td>{bahan.kuantitas} {bahan.satuan}</td>
                      <td>{formatCurrency(bahan.harga)}</td>
                      <td className="font-medium">
                        {formatCurrency(bahan.harga * bahan.kuantitas)}
                      </td>
                      <td>
                        <Badge variant={getStatusBadge(bahan.status)}>
                          {bahan.status}
                        </Badge>
                      </td>
                      <td>{formatDate(bahan.tanggal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimoni Modal */}
      <Modal
        isOpen={isTestimoniModalOpen}
        onClose={() => setIsTestimoniModalOpen(false)}
        title="Berikan Testimoni"
      >
        <form onSubmit={handleSubmitTestimoni} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Komentar"
            placeholder="Bagikan pengalaman Anda dengan proyek ini..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsTestimoniModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit">Kirim Testimoni</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}