// FILE: app/(dashboard)/mandor/proyek/[id]/components/modals/DeleteConfirmModal.tsx
'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  milestone?: {
    id: string
    nama: string
  } | null
  onConfirm: () => void
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  milestone,
  onConfirm
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus Milestone"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Apakah Anda yakin ingin menghapus milestone{' '}
          <strong className="text-red-600">{milestone?.nama}</strong>?
        </p>
        
        {milestone && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data milestone akan dihapus permanen.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <span>Batal</span>
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}