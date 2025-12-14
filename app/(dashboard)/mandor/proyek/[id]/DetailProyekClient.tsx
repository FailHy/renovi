// FILE: app/(dashboard)/mandor/proyek/[id]/DetailProyekKlienClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ProjectHeader } from '@/components/mandor/ProjectHeader'
import { Tabs } from '@/components/mandor/Tabs'
import { ProjectInfoTab } from '@/components/mandor/ProjectInfo'
import { MilestoneTab } from '@/components/mandor/Milestonetab'
import { BahanHarianTab } from '@/components/mandor/BahanHariantab'
import { ProgressModal } from '@/components/mandor/modals/ProgressModal'
import { MilestoneModal } from '@/components/mandor/modals/MilestoneModal'
import { DeleteConfirmModal } from '@/components/mandor/modals/DeleteModal'
import type { Project, Mandor, Milestone } from '@/components/mandor/type'

interface DetailProyekClientProps {
  project: Project
  initialMilestones: Milestone[]
  mandor: Mandor
}

export function DetailProyekClient({ 
  project: initialProject, 
  initialMilestones,
  mandor 
}: DetailProyekClientProps) {

  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'milestone' | 'bahan'>('info')

  const [project, setProject] = useState(initialProject)
  const [milestones, setMilestones] = useState(initialMilestones)

  // Modal states
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [newProgress, setNewProgress] = useState(project.progress)

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (milestones.length > 0) {
      const completed = milestones.filter(m => m.status === 'Selesai').length
      const autoProgress = Math.round((completed / milestones.length) * 100)

      if (Math.abs(autoProgress - project.progress) >= 5) {
        setProject(prev => ({ ...prev, progress: autoProgress }))
        setNewProgress(autoProgress)
      }
    }
  }, [milestones])

  /** ===============================
   *    UPDATE PROGRESS MANUAL
   *  =============================== */
  const handleUpdateProgress = async () => {
    try {
      const { updateProjectProgress } = await import('@/lib/actions/mandor/proyek')
      const result = await updateProjectProgress(project.id, mandor.id, newProgress)

      if (!result.success) throw new Error(result.error)

      //  UPDATE STATE LOKAL
      setProject(prev => ({ ...prev, progress: newProgress }))
      
      setIsProgressModalOpen(false)
      toast.success('Progress berhasil diupdate')
      
      //  REFRESH DARI SERVER
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate progress')
    }
  }

  /** ===============================
   *         TAMBAH / EDIT MILESTONE
   *  =============================== */
  const handleOpenMilestoneModal = (milestone?: Milestone) => {
    setEditingMilestone(milestone || null)
    setIsMilestoneModalOpen(true)
  }

  const handleCloseMilestoneModal = () => {
    setEditingMilestone(null)
    setIsMilestoneModalOpen(false)
  }

  const handleSubmitMilestone = async (data: {
    id?: string
    nama: string
    deskripsi: string
    tanggal: string
  }) => {
    setSubmitting(true)
    try {
      const payload = {
        proyekId: project.id,
        nama: data.nama,
        deskripsi: data.deskripsi,
        tanggal: data.tanggal
      }

      const { createMilestone, updateMilestone } = await import('@/lib/actions/mandor/milestone')

      const result = data.id
        ? await updateMilestone(data.id, payload)
        : await createMilestone({ ...payload, status: 'Belum Dimulai' })

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Gagal menyimpan milestone'
        }
      }

      // Di dalam handleSubmitMilestone:
      if (data.id) {
        // Update milestone yang sudah ada
        setMilestones(prev => prev.map(m => 
          m.id === data.id && result.data
            ? { 
                ...m, 
                ...result.data, 
                tanggal: new Date(result.data.tanggal).toISOString()
              }
            : m
        ))
      } else {
        // Tambah milestone baru
        if (result.data) {
          const newMilestone = {
            ...result.data,
            tanggal: new Date(result.data.tanggal).toISOString()
          }
          setMilestones(prev => [...prev, newMilestone])
        }
      }

      toast.success(data.id ? 'Milestone berhasil diupdate' : 'Milestone berhasil ditambahkan')
      handleCloseMilestoneModal()
      
      //  REFRESH DARI SERVER UNTUK SINKRONISASI
      router.refresh()
      
      return {
        success: true
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Gagal menyimpan milestone'
      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setSubmitting(false)
    }
  }

  /** ===============================
   *           DELETE MILESTONE
   *  =============================== */
  const handleDeleteClick = (milestone: Milestone) => {
    setDeletingMilestone(milestone)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteMilestone = async () => {
    if (!deletingMilestone) return

    try {
      const { deleteMilestone } = await import('@/lib/actions/mandor/milestone')
      const result = await deleteMilestone(deletingMilestone.id)

      if (!result.success) throw new Error(result.error)

      //  UPDATE STATE LOKAL: Hapus milestone dari array
      setMilestones(prev => prev.filter(m => m.id !== deletingMilestone.id))
      
      toast.success('Milestone berhasil dihapus')
      setIsDeleteModalOpen(false)
      setDeletingMilestone(null)
      
      //  REFRESH DARI SERVER
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus milestone')
    }
  }

  /** ===============================
   *     UPDATE STATUS MILESTONE
   *  =============================== */
  const handleUpdateMilestoneStatus = async (milestoneId: string, status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai') => {
    try {
      const { updateMilestoneStatus } = await import('@/lib/actions/mandor/milestone')
      const result = await updateMilestoneStatus(milestoneId, status)

      if (!result.success) throw new Error(result.error)

      //  UPDATE STATE LOKAL: Update status milestone
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId 
          ? { ...m, status: status, updatedAt: new Date()} 
          : m
      ))

      toast.success(`Status milestone berhasil diubah menjadi ${status}`)
      
      //  REFRESH DARI SERVER
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate status milestone')
    }
  }

  /** ===============================
   *             RENDER
   *  =============================== */
  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader project={project} mandor={mandor} />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'info' && (
          <ProjectInfoTab 
            project={project}
            milestones={milestones}
            onProgressClick={() => setIsProgressModalOpen(true)}
          />
        )}

        {activeTab === 'milestone' && (
          <MilestoneTab 
            milestones={milestones}
            onAddMilestone={() => handleOpenMilestoneModal()}
            onEditMilestone={handleOpenMilestoneModal}
            onDeleteMilestone={handleDeleteClick}
            onUpdateStatus={handleUpdateMilestoneStatus} //  Pass the status handler
          />
        )}

        {activeTab === 'bahan' && (
          <BahanHarianTab 
            project={project}
            milestones={milestones}
          />
        )}
      </div>

      {/* Modals */}
      <ProgressModal 
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        currentProgress={project.progress}
        newProgress={newProgress}
        setNewProgress={setNewProgress}
        onUpdate={handleUpdateProgress}
      />

      <MilestoneModal 
        isOpen={isMilestoneModalOpen}
        onClose={handleCloseMilestoneModal}
        milestone={editingMilestone}
        onSubmit={handleSubmitMilestone}
        isSubmitting={submitting}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        milestone={deletingMilestone}
        onConfirm={confirmDeleteMilestone}
      />
    </div>
  )
}