// FILE: app/(dashboard)/mandor/proyek/[id]/DetailProyekClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Calendar, MapPin, User, Phone, Loader2, Camera, Upload, Check } from 'lucide-react'
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
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [newProgress, setNewProgress] = useState(project.progress)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null)

  // ✅ 1. AUTO CALCULATE PROGRESS BASED ON MILESTONES
  useEffect(() => {
    if (milestones.length > 0) {
      const completedMilestones = milestones.filter(m => m.status === 'Selesai').length
      const autoProgress = Math.round((completedMilestones / milestones.length) * 100)
      
      // Update progress if different from current (with threshold to avoid flickering)
      if (Math.abs(autoProgress - project.progress) >= 5) {
        setProject(prev => ({ ...prev, progress: autoProgress }))
        // Optionally save to database
        // handleUpdateProgress(autoProgress)
      }
    }
  }, [milestones, project.progress])

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
        proyekId: project.id,
        nama: formData.get('nama') as string,
        deskripsi: formData.get('deskripsi') as string,
        tanggal: formData.get('tanggal') as string,
        status: formData.get('status') as 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
      }

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
      
      // Refresh data
      router.refresh()
      
    } catch (error: any) {
      console.error('Error saving milestone:', error)
      toast.error(error.message || 'Gagal menyimpan milestone')
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ 4. BETTER DELETE CONFIRMATION WITH MODAL
  const handleDeleteClick = (milestone: Milestone) => {
    setDeletingMilestone(milestone)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteMilestone = async () => {
    if (!deletingMilestone) return

    try {
      const { deleteMilestone } = await import('@/lib/actions/mandor/milestone')
      const result = await deleteMilestone(deletingMilestone.id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete milestone')
      }

      toast.success('Milestone berhasil dihapus')
      setIsDeleteModalOpen(false)
      setDeletingMilestone(null)
      
      // Refresh data
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting milestone:', error)
      toast.error(error.message || 'Gagal menghapus milestone')
    }
  }

  const handleUpdateProgress = async () => {
    try {
      const { updateProjectProgress } = await import('@/lib/actions/mandor/proyek')
      const result = await updateProjectProgress(project.id, mandor.id, newProgress)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update progress')
      }

      // Update local state
      setProject(prev => ({ ...prev, progress: newProgress }))
      setIsProgressModalOpen(false)
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
    <div className="min-h-screen bg-white">
      {/* Custom Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {project.nama}
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {project.tipeLayanan}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="text-right">
              <p className="font-medium text-gray-900 text-sm">
                {mandor.nama}
              </p>
              <p className="text-xs text-gray-500">
                Mandor
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium text-sm">{getInitials(mandor.nama)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-lg">
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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Informasi Proyek */}
      {activeTab === 'info' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Detail Proyek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="mt-1">
                    <Badge variant={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600 block">Auto Progress</span>
                  <span className="text-xs text-gray-500">
                    {milestones.filter(m => m.status === 'Selesai').length} dari {milestones.length} milestone selesai
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewProgress(project.progress)
                    setIsProgressModalOpen(true)
                  }}
                  className="w-full mt-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
                >
                  <Pencil className="w-4 h-4" />
                  <span>Update Progress</span>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Deskripsi Proyek
                  </label>
                  <p className="text-gray-900 leading-relaxed">
                    {project.deskripsi}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Lokasi Proyek
                    </label>
                    <p className="text-gray-900 mt-1">
                      {project.alamat}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Tanggal Mulai
                    </label>
                    <p className="text-gray-900 mt-1">
                      {formatDate(project.mulai)}
                    </p>
                  </div>
                </div>

                {project.selesai && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600">
                        Tanggal Selesai
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formatDate(project.selesai)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600">
                    Nama Pelanggan
                  </label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {project.pelanggan.nama}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600">
                    Nomor Telepon
                  </label>
                  <p className="text-gray-900 mt-1 font-medium">
                    {project.pelanggan.telpon}
                  </p>
                </div>
              </div>

              {project.pelanggan.email && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900 mt-1">
                      {project.pelanggan.email}
                    </p>
                  </div>
                </div>
              )}

              {project.pelanggan.alamat && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Alamat Pelanggan
                    </label>
                    <p className="text-gray-900 mt-1">
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
              <h3 className="text-xl font-semibold text-gray-900">
                Daftar Milestone
              </h3>
              <p className="text-gray-600 mt-1">
                {milestones.length} milestone ditemukan
              </p>
            </div>
            <Button 
              onClick={() => handleOpenMilestoneModal()}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Milestone</span>
            </Button>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {milestone.nama}
                        </h4>
                        <Badge variant={getStatusBadge(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {milestone.deskripsi}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="text-gray-500">Target:</span>
                            <p className="font-medium text-gray-900">
                              {formatDate(milestone.tanggal)}
                            </p>
                          </div>
                        </div>
                        {milestone.mulai && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <div>
                              <span className="text-gray-500">Mulai:</span>
                              <p className="font-medium text-gray-900">
                                {formatDate(milestone.mulai)}
                              </p>
                            </div>
                          </div>
                        )}
                        {milestone.selesai && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <div>
                              <span className="text-gray-500">Selesai:</span>
                              <p className="font-medium text-gray-900">
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
                        onClick={() => handleOpenMilestoneModal(milestone)}
                        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="lg:sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                        onClick={() => handleDeleteClick(milestone)}
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
              <Card className="bg-white border border-gray-200">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada milestone
                  </h4>
                  <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    Tambahkan milestone pertama untuk melacak progress proyek Anda.
                  </p>
                  <Button 
                    onClick={() => handleOpenMilestoneModal()} 
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Milestone Pertama</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Bahan Harian - ✅ 3. ENABLED */}
      {activeTab === 'bahan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Bahan Harian
              </h3>
              <p className="text-gray-600 mt-1">
                Kelola bahan dan material proyek harian
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                📸 Upload Foto Bahan
              </h4>
              <p className="text-gray-600 mb-4">
                Upload foto bahan yang digunakan hari ini untuk dokumentasi proyek
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Option 1: File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h5 className="font-medium text-gray-900 mb-2">Upload dari File</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Pilih foto dari galeri atau file manager
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        toast.success(`File "${file.name}" siap diupload`)
                        // Implement upload logic here
                      }
                    }}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Pilih File
                  </label>
                </div>

                {/* Option 2: Camera */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h5 className="font-medium text-gray-900 mb-2">Ambil Foto</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Gunakan kamera untuk mengambil foto langsung
                  </p>
                  <Button
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.mediaDevices) {
                        // Mobile camera access
                        toast.success('Akses kamera diaktifkan (simulasi)')
                        // Implement camera logic here
                      } else {
                        toast.error('Kamera tidak tersedia di perangkat ini')
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Buka Kamera</span>
                  </Button>
                </div>
              </div>

              {/* Material Input Form */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  📝 Input Bahan Harian
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Bahan
                      </label>
                      <Input
                        placeholder="Contoh: Semen, Pasir, Batu Bata"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select 
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Pilih Status</option>
                        <option value="Digunakan">Digunakan</option>
                        <option value="Sisa">Sisa</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah (Kuantitas)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Contoh: 10"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Satuan
                      </label>
                      <select 
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Pilih Satuan</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="sak">Sak</option>
                        <option value="m2">Meter Persegi (m²)</option>
                        <option value="m3">Meter Kubik (m³)</option>
                        <option value="buah">Buah</option>
                        <option value="lembar">Lembar</option>
                        <option value="meter">Meter</option>
                        <option value="liter">Liter</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga (Rp)
                      </label>
                      <Input
                        type="number"
                        step="1000"
                        placeholder="Contoh: 50000"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      placeholder="Tambahkan keterangan tentang penggunaan bahan..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Milestone (Opsional)
                    </label>
                    <select 
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Pilih Milestone terkait</option>
                      {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                          {milestone.nama}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hubungkan bahan dengan milestone tertentu jika diperlukan
                    </p>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Simpan Data Bahan</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Update Progress Proyek"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Progress saat ini: <span className="font-bold text-blue-600">{project.progress}%</span>
            </label>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Progress Baru</span>
                <span className="text-sm font-bold text-blue-600">{newProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {[0, 25, 50, 75, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNewProgress(value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newProgress === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProgressModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              onClick={handleUpdateProgress}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Progress
            </Button>
          </div>
        </div>
      </Modal>

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
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsikan detail milestone, tahapan kerja, dan target yang ingin dicapai..."
            rows={4}
            name="deskripsi"
            defaultValue={editingMilestone?.deskripsi}
            required
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
          />
          <Input 
            label="Tanggal Target" 
            type="date"
            name="tanggal"
            defaultValue={editingMilestone?.tanggal ? new Date(editingMilestone.tanggal).toISOString().split('T')[0] : ''}
            required
            className="bg-white border-gray-300 text-gray-900"
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
            className="bg-white border-gray-300 text-gray-900"
          />

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseMilestoneModal}
              disabled={submitting}
              className="min-w-24 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
            >
              <span>Batal</span>
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="min-w-24 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{editingMilestone ? 'Mengupdate...' : 'Menyimpan...'}</span>
                </>
              ) : (
                editingMilestone ? 'Update' : 'Simpan'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ✅ 4. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Milestone"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus milestone{' '}
            <strong className="text-red-600">{deletingMilestone?.nama}</strong>?
          </p>
          
          {deletingMilestone && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data milestone akan dihapus permanen.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
            >
              <span>Batal</span>
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteMilestone}
              className="bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2" // ✅ 2. FIXED BUTTON ALIGNMENT
            >
              <Trash2 className="w-4 h-4" />
              <span>Ya, Hapus</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}