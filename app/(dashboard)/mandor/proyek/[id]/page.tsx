'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Pencil, Trash2, Calendar, MapPin, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

// Mock data
const mockProject = {
  id: '1',
  nama: 'Renovasi Rumah Pak Budi',
  tipeLayanan: 'Renovasi Rumah',
  deskripsi: 'Renovasi total bagian dapur dan kamar mandi',
  alamat: 'Jl. Sudirman No. 123, Pekanbaru',
  telpon: '08123456789',
  status: 'Dalam Progress',
  progress: 45,
  mulai: '2024-01-01',
  pelanggan: {
    nama: 'John Doe',
    telpon: '08198765432',
  },
}

const mockMilestones = [
  {
    id: '1',
    nama: 'Pembongkaran Dapur Lama',
    deskripsi: 'Membongkar keramik dan kabinet lama',
    status: 'Selesai',
    tanggal: '2024-01-05',
    mulai: '2024-01-03',
    selesai: '2024-01-05',
  },
  {
    id: '2',
    nama: 'Pemasangan Keramik Baru',
    deskripsi: 'Memasang keramik lantai dan dinding',
    status: 'Dalam Progress',
    tanggal: '2024-01-10',
    mulai: '2024-01-06',
    selesai: null,
  },
  {
    id: '3',
    nama: 'Instalasi Kabinet',
    deskripsi: 'Memasang kabinet dapur custom',
    status: 'Belum Dimulai',
    tanggal: '2024-01-20',
    mulai: null,
    selesai: null,
  },
]

export default function DetailProyekMandorPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'info' | 'milestone' | 'bahan'>('info')
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Perencanaan': 'info',
      'Dalam Progress': 'warning',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
      'Belum Dimulai': 'info',
    }
    return variants[status] || 'info'
  }

  const handleOpenMilestoneModal = (milestone?: any) => {
    setEditingMilestone(milestone || null)
    setIsMilestoneModalOpen(true)
  }

  return (
    <div>
      <DashboardHeader
        title={mockProject.nama}
        description={mockProject.tipeLayanan}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-light-primary dark:hover:text-dark-primary'
          }`}
        >
          Informasi Proyek
        </button>
        <button
          onClick={() => setActiveTab('milestone')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'milestone'
              ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-light-primary dark:hover:text-dark-primary'
          }`}
        >
          Milestone
        </button>
        <button
          onClick={() => setActiveTab('bahan')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'bahan'
              ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-light-primary dark:hover:text-dark-primary'
          }`}
        >
          Bahan Harian
        </button>
      </div>

      {/* Tab Content: Informasi Proyek */}
      {activeTab === 'info' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Proyek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={getStatusBadge(mockProject.status)}>
                    {mockProject.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Progress
                </label>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
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

              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                <div>
                  <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Tanggal Mulai
                  </label>
                  <p className="mt-1">{formatDate(mockProject.mulai)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                <div>
                  <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Nama Pelanggan
                  </label>
                  <p className="mt-1 font-medium">{mockProject.pelanggan.nama}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary mt-0.5" />
                <div>
                  <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Nomor Telepon
                  </label>
                  <p className="mt-1">{mockProject.pelanggan.telpon}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Milestone */}
      {activeTab === 'milestone' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Daftar Milestone</h3>
            <Button onClick={() => handleOpenMilestoneModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Milestone
            </Button>
          </div>

          <div className="space-y-4">
            {mockMilestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">{milestone.nama}</h4>
                        <Badge variant={getStatusBadge(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        {milestone.deskripsi}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        
                        variant="ghost"
                        onClick={() => handleOpenMilestoneModal(milestone)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">
                        Target:
                      </span>
                      <p className="font-medium">{formatDate(milestone.tanggal)}</p>
                    </div>
                    {milestone.mulai && (
                      <div>
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Mulai:
                        </span>
                        <p className="font-medium">{formatDate(milestone.mulai)}</p>
                      </div>
                    )}
                    {milestone.selesai && (
                      <div>
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">
                          Selesai:
                        </span>
                        <p className="font-medium">{formatDate(milestone.selesai)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {mockMilestones.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Belum ada milestone. Klik tombol "Tambah Milestone" untuk menambahkan.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Bahan Harian */}
      {activeTab === 'bahan' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Bahan Harian</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Bahan
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Fitur bahan harian akan segera hadir
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Milestone Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title={editingMilestone ? 'Edit Milestone' : 'Tambah Milestone'}
      >
        <form className="space-y-4">
          <Input label="Nama Milestone" placeholder="Contoh: Pemasangan Keramik" />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsikan detail milestone..."
            rows={3}
          />
          <Input label="Tanggal Target" type="date" />
          <Select
            label="Status"
            options={[
              { value: 'Belum Dimulai', label: 'Belum Dimulai' },
              { value: 'Dalam Progress', label: 'Dalam Progress' },
              { value: 'Selesai', label: 'Selesai' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsMilestoneModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit">
              {editingMilestone ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}