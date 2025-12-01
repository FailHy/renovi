// FILE: app/(dashboard)/mandor/proyek/[id]/DetailProyekClient.tsx
// ========================================
'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Calendar, MapPin, User, Phone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Types
interface Pelanggan {
  id: string
  nama: string
  telpon: string
  email?: string
  alamat?: string
}

interface Milestone {
  id: string
  nama: string
  deskripsi: string
  status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
  tanggal: string
  mulai?: string
  selesai?: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  nama: string
  tipeLayanan: string
  deskripsi: string
  alamat: string
  telpon: string
  status: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
  progress: number
  mulai: string
  selesai?: string
  pelanggan: Pelanggan
  budget?: number
  createdAt: string
  updatedAt: string
}

interface DetailProyekClientProps {
  project: Project
  initialMilestones: Milestone[]
  mandor: {
    id: string
    nama: string
  }
}

export function DetailProyekClient({ 
  project: initialProject, 
  initialMilestones,
  mandor 
}: DetailProyekClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'milestone' | 'bahan'>('info')
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [project, setProject] = useState(initialProject)
  const [milestones, setMilestones] = useState(initialMilestones)

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

  const handleOpenMilestoneModal = (milestone?: Milestone) => {
    setEditingMilestone(milestone || null)
    setIsMilestoneModalOpen(true)
  }

  const handleCloseMilestoneModal = () => {
    setEditingMilestone(null)
    setIsMilestoneModalOpen(false)
  }

  const handleSubmitMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const milestoneData = {
        proyekId: project.id, // ✅ tambahkan proyekId
        nama: formData.get('nama') as string,
        deskripsi: formData.get('deskripsi') as string,
        tanggal: formData.get('tanggal') as string,
        status: formData.get('status') as 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
      }

      // ✅ Gunakan server action langsung (tanpa API route)
      const { createMilestone, updateMilestone } = await import('@/lib/actions/mandor/milestone')
      
      let result
      if (editingMilestone) {
        result = await updateMilestone(editingMilestone.id, milestoneData)
      } else {
        result = await createMilestone(milestoneData)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save milestone')
      }

      toast.success(editingMilestone ? 'Milestone berhasil diupdate' : 'Milestone berhasil ditambahkan')
      handleCloseMilestoneModal()
      
      // Refresh page to get updated data
      router.refresh()
      
    } catch (error: any) {
      console.error('Error saving milestone:', error)
      toast.error(error.message || 'Gagal menyimpan milestone')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus milestone ini?')) {
      return
    }

    try {
      const { deleteMilestone } = await import('@/lib/actions/mandor/milestone')
      const result = await deleteMilestone(milestoneId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete milestone')
      }

      toast.success('Milestone berhasil dihapus')
      
      // Refresh page
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting milestone:', error)
      toast.error(error.message || 'Gagal menghapus milestone')
    }
  }

  const handleUpdateProgress = async (newProgress: number) => {
    try {
      const { updateProjectProgress } = await import('@/lib/actions/mandor/proyek')
      const result = await updateProjectProgress(project.id, mandor.id, newProgress)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update progress')
      }

      // Update local state
      setProject(prev => ({ ...prev, progress: newProgress }))
      toast.success('Progress berhasil diupdate')
      
    } catch (error: any) {
      console.error('Error updating progress:', error)
      toast.error(error.message || 'Gagal mengupdate progress')
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Custom Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {project.nama}
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2 text-sm sm:text-base">
              {project.tipeLayanan}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-light-card dark:bg-dark-card rounded-lg px-4 py-3 shadow-sm">
            <div className="text-right">
              <p className="font-medium text-light-text-primary dark:text-dark-text-primary text-sm">
                {mandor.nama}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Mandor
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-light-primary to-light-primary/80 dark:from-dark-primary dark:to-dark-primary/80 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium text-sm">{getInitials(mandor.nama)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-light-card dark:bg-dark-card rounded-lg shadow-sm">
        {[
          { id: 'info', label: 'Informasi Proyek' },
          { id: 'milestone', label: 'Milestone' },
          { id: 'bahan', label: 'Bahan Harian' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-light-primary dark:text-dark-primary shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-primary dark:hover:text-dark-primary hover:bg-white/50 dark:hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Informasi Proyek */}
      {activeTab === 'info' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Detail Proyek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-light-background dark:bg-dark-background rounded-lg">
                <div>
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Status</span>
                  <div className="mt-1">
                    <Badge variant={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-light-primary dark:text-dark-primary">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-light-primary to-light-primary/80 dark:from-dark-primary dark:to-dark-primary/80 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newProgress = prompt('Masukkan progress baru (0-100):', project.progress.toString())
                    if (newProgress !== null) {
                      const progress = parseInt(newProgress)
                      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                        handleUpdateProgress(progress)
                      } else {
                        toast.error('Progress harus antara 0-100')
                      }
                    }
                  }}
                  className="w-full mt-2"
                >
                  Update Progress
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2 block">
                    Deskripsi Proyek
                  </label>
                  <p className="text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                    {project.deskripsi}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-light-background dark:bg-dark-background rounded-lg">
                  <MapPin className="w-5 h-5 text-light-primary dark:text-dark-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Lokasi Proyek
                    </label>
                    <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                      {project.alamat}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-light-background dark:bg-dark-background rounded-lg">
                  <Calendar className="w-5 h-5 text-light-primary dark:text-dark-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Tanggal Mulai
                    </label>
                    <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                      {formatDate(project.mulai)}
                    </p>
                  </div>
                </div>

                {project.selesai && (
                  <div className="flex items-start gap-3 p-3 bg-light-background dark:bg-dark-background rounded-lg">
                    <Calendar className="w-5 h-5 text-light-primary dark:text-dark-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Tanggal Selesai
                      </label>
                      <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                        {formatDate(project.selesai)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-light-background dark:bg-dark-background rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Nama Pelanggan
                  </label>
                  <p className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mt-1">
                    {project.pelanggan.nama}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-light-background dark:bg-dark-background rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Nomor Telepon
                  </label>
                  <p className="text-light-text-primary dark:text-dark-text-primary mt-1 font-medium">
                    {project.pelanggan.telpon}
                  </p>
                </div>
              </div>

              {project.pelanggan.email && (
                <div className="flex items-start gap-3 p-4 bg-light-background dark:bg-dark-background rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Email
                    </label>
                    <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                      {project.pelanggan.email}
                    </p>
                  </div>
                </div>
              )}

              {project.pelanggan.alamat && (
                <div className="flex items-start gap-3 p-4 bg-light-background dark:bg-dark-background rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                      Alamat Pelanggan
                    </label>
                    <p className="text-light-text-primary dark:text-dark-text-primary mt-1">
                      {project.pelanggan.alamat}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Milestone */}
      {activeTab === 'milestone' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                Daftar Milestone
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                {milestones.length} milestone ditemukan
              </p>
            </div>
            <Button 
              onClick={() => handleOpenMilestoneModal()}
              className="bg-light-primary hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Milestone
            </Button>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">
                          {milestone.nama}
                        </h4>
                        <Badge variant={getStatusBadge(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                        {milestone.deskripsi}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                          <div>
                            <span className="text-light-text-secondary dark:text-dark-text-secondary">Target:</span>
                            <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                              {formatDate(milestone.tanggal)}
                            </p>
                          </div>
                        </div>
                        {milestone.mulai && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <div>
                              <span className="text-light-text-secondary dark:text-dark-text-secondary">Mulai:</span>
                              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                {formatDate(milestone.mulai)}
                              </p>
                            </div>
                          </div>
                        )}
                        {milestone.selesai && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <div>
                              <span className="text-light-text-secondary dark:text-dark-text-secondary">Selesai:</span>
                              <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                {formatDate(milestone.selesai)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 lg:flex-col">
                      <Button
                        variant="outline"
                        // size="sm"
                        onClick={() => handleOpenMilestoneModal(milestone)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="lg:sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        // size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20 flex items-center gap-2"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="lg:sr-only">Hapus</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {milestones.length === 0 && (
              <Card className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Belum ada milestone
                  </h4>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 max-w-sm mx-auto">
                    Tambahkan milestone pertama untuk melacak progress proyek Anda.
                  </p>
                  <Button onClick={() => handleOpenMilestoneModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Milestone Pertama
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Bahan Harian */}
      {activeTab === 'bahan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                Bahan Harian
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Kelola bahan dan material proyek
              </p>
            </div>
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Bahan
            </Button>
          </div>

          <Card className="bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                Fitur Segera Hadir
              </h4>
              <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto leading-relaxed">
                Kami sedang mengembangkan fitur manajemen bahan harian untuk membantu Anda melacak material dan pengeluaran proyek dengan lebih efisien.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Milestone Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={handleCloseMilestoneModal}
        title={editingMilestone ? 'Edit Milestone' : 'Tambah Milestone Baru'}
      >
        <form onSubmit={handleSubmitMilestone} className="space-y-6">
          <Input 
            label="Nama Milestone" 
            placeholder="Contoh: Pemasangan Keramik Dapur"
            name="nama"
            defaultValue={editingMilestone?.nama}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsikan detail milestone, tahapan kerja, dan target yang ingin dicapai..."
            rows={4}
            name="deskripsi"
            defaultValue={editingMilestone?.deskripsi}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          />
          <Input 
            label="Tanggal Target" 
            type="date"
            name="tanggal"
            defaultValue={editingMilestone?.tanggal ? new Date(editingMilestone.tanggal).toISOString().split('T')[0] : ''}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
          <Select
            label="Status"
            name="status"
            defaultValue={editingMilestone?.status || 'Belum Dimulai'}
            options={[
              { value: 'Belum Dimulai', label: '🟡 Belum Dimulai' },
              { value: 'Dalam Progress', label: '🔵 Dalam Progress' },
              { value: 'Selesai', label: '✅ Selesai' },
            ]}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseMilestoneModal}
              disabled={submitting}
              className="min-w-24"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="min-w-24 bg-light-primary hover:bg-light-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {editingMilestone ? 'Mengupdate...' : 'Menyimpan...'}
                </>
              ) : (
                editingMilestone ? 'Update' : 'Simpan'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}