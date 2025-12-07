// FILE: app/(dashboard)/mandor/proyek/[id]/components/modals/MilestoneModal.tsx
'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Select } from '@/components/ui/Select'

interface MilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  milestone?: {
    id: string
    nama: string
    deskripsi: string
    tanggal: string
    status: 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
  } | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
}

export function MilestoneModal({
  isOpen,
  onClose,
  milestone,
  onSubmit,
  isSubmitting
}: MilestoneModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={milestone ? 'Edit Milestone' : 'Tambah Milestone Baru'}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <Input 
          label="Nama Milestone" 
          placeholder="Contoh: Pemasangan Keramik Dapur"
          name="nama"
          defaultValue={milestone?.nama}
          required
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
        />
        <Textarea
          label="Deskripsi"
          placeholder="Deskripsikan detail milestone, tahapan kerja, dan target yang ingin dicapai..."
          rows={4}
          name="deskripsi"
          defaultValue={milestone?.deskripsi}
          required
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
        />
        <Input 
          label="Tanggal Target" 
          type="date"
          name="tanggal"
          defaultValue={milestone?.tanggal ? new Date(milestone.tanggal).toISOString().split('T')[0] : ''}
          required
          className="bg-white border-gray-300 text-gray-900"
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