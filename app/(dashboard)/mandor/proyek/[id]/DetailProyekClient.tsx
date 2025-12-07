// FILE: app/(dashboard)/mandor/proyek/[id]/DetailProyekClient.tsx
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
import type { Project, Milestone, Mandor } from '@/components/mandor/type'

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
  const [submitting, setSubmitting] = useState(false)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null)

  // Auto-calculate progress
  useEffect(() => {
    if (milestones.length > 0) {
      const completed = milestones.filter(m => m.status === 'Selesai').length
      const autoProgress = Math.round((completed / milestones.length) * 100)
      
      if (Math.abs(autoProgress - project.progress) >= 5) {
        setProject(prev => ({ ...prev, progress: autoProgress }))
      }
    }
  }, [milestones, project.progress])

  // Progress functions
  const handleUpdateProgress = async () => {
    try {
      const { updateProjectProgress } = await import('@/lib/actions/mandor/proyek')
      const result = await updateProjectProgress(project.id, mandor.id, newProgress)

      if (!result.success) throw new Error(result.error)
      
      setProject(prev => ({ ...prev, progress: newProgress }))
      setIsProgressModalOpen(false)
      toast.success('Progress berhasil diupdate')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate progress')
    }
  }

  // Milestone functions
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
        status: formData.get('status') as any
      }

      const { createMilestone, updateMilestone } = await import('@/lib/actions/mandor/milestone')
      
      const result = editingMilestone
        ? await updateMilestone(editingMilestone.id, milestoneData)
        : await createMilestone(milestoneData)

      if (!result.success) throw new Error(result.error)
      
      toast.success(editingMilestone ? 'Milestone berhasil diupdate' : 'Milestone berhasil ditambahkan')
      handleCloseMilestoneModal()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan milestone')
    } finally {
      setSubmitting(false)
    }
  }

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
      
      toast.success('Milestone berhasil dihapus')
      setIsDeleteModalOpen(false)
      setDeletingMilestone(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus milestone')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader 
        project={project} 
        mandor={mandor}
      />

      <Tabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
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