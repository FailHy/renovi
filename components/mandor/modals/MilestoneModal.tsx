// FILE: app/(dashboard)/mandor/proyek/[id]/components/modals/MilestoneModal.tsx
'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { useState, useEffect } from 'react'

interface MilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  milestone?: {
    id: string
    nama: string
    deskripsi: string
    tanggal: string
    // status dihapus dari props interface modal
  } | null
  onSubmit: (formData: {
    id?: string
    nama: string
    deskripsi: string
    tanggal: string
    // status dihapus juga dari onSubmit parameter
  }) => Promise<{ success: boolean; error?: string }>
  isSubmitting: boolean
}

export function MilestoneModal({
  isOpen,
  onClose,
  milestone,
  onSubmit,
  isSubmitting
}: MilestoneModalProps) {
  const [formData, setFormData] = useState({
    nama: milestone?.nama || '',
    deskripsi: milestone?.deskripsi || '',
    tanggal: milestone?.tanggal ? new Date(milestone.tanggal).toISOString().split('T')[0] : ''
    // status dihapus dari state
  })

  // Update form data when milestone changes
  useEffect(() => {
    if (milestone) {
      setFormData({
        nama: milestone.nama,
        deskripsi: milestone.deskripsi,
        tanggal: new Date(milestone.tanggal).toISOString().split('T')[0]
        // status dihapus
      })
    } else {
      setFormData({
        nama: '',
        deskripsi: '',
        tanggal: ''
        // status dihapus
      })
    }
  }, [milestone])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.nama.trim() || !formData.deskripsi.trim() || !formData.tanggal) {
      alert('Harap isi semua field yang diperlukan')
      return
    }

    // Call parent onSubmit with the form data
    const result = await onSubmit({
      id: milestone?.id,
      ...formData
    })

    if (result.success) {
      onClose()
    } else {
      alert(result.error || 'Terjadi kesalahan')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={milestone ? 'Edit Milestone' : 'Tambah Milestone Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Nama Milestone" 
          placeholder="Contoh: Pemasangan Keramik Dapur"
          name="nama"
          value={formData.nama}
          onChange={handleInputChange}
          required
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          disabled={isSubmitting}
        />
        
        <Textarea
          label="Deskripsi"
          placeholder="Deskripsikan detail milestone, tahapan kerja, dan target yang ingin dicapai..."
          rows={4}
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleInputChange}
          required
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
          disabled={isSubmitting}
        />
        
        <Input 
          label="Tanggal Target" 
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleInputChange}
          required
          className="bg-white border-gray-300 text-gray-900"
          disabled={isSubmitting}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-w-24 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <span>Batal</span>
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-24 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{milestone ? 'Mengupdate...' : 'Menyimpan...'}</span>
              </>
            ) : (
              milestone ? 'Update' : 'Simpan'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}