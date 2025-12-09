// FILE: components/modals/DeleteConfirmModal.tsx
'use client'

import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  itemName?: string
  itemType?: 'bahan' | 'milestone' | 'nota' | 'proyek' | 'custom'
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  itemName,
  itemType = 'bahan',
  onConfirm,
  isLoading = false
}: DeleteConfirmModalProps) {
  // Default title berdasarkan item type
  const defaultTitle = `Konfirmasi Hapus ${itemType === 'bahan' ? 'Bahan' : 
                       itemType === 'milestone' ? 'Milestone' : 
                       itemType === 'nota' ? 'Nota' : 
                       itemType === 'proyek' ? 'Proyek' : 'Item'}`

  // Default description berdasarkan item type
  const defaultDescription = itemType === 'bahan' 
    ? 'Apakah Anda yakin ingin menghapus bahan ini?'
    : itemType === 'milestone'
    ? 'Apakah Anda yakin ingin menghapus milestone ini?'
    : itemType === 'nota'
    ? 'Apakah Anda yakin ingin menghapus nota ini?'
    : itemType === 'proyek'
    ? 'Apakah Anda yakin ingin menghapus proyek ini?'
    : 'Apakah Anda yakin ingin menghapus item ini?'

  // Warning message berdasarkan item type
  const getWarningMessage = () => {
    switch(itemType) {
      case 'bahan':
        return 'Data bahan akan dihapus permanen dan tidak dapat dikembalikan.'
      case 'milestone':
        return 'Semua data milestone termasuk progres akan dihapus permanen.'
      case 'nota':
        return 'Semua bahan dalam nota ini juga akan dihapus.'
      case 'proyek':
        return 'Semua data proyek termasuk milestone, nota, dan bahan akan dihapus.'
      default:
        return 'Tindakan ini tidak dapat dibatalkan.'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || defaultTitle}
      size="md"
    >
      <div className="space-y-4">
        {/* Icon & Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Description */}
        <div className="text-center">
          <p className="text-gray-700 mb-2">
            {description || defaultDescription}
          </p>
          
          {itemName && (
            <div className="inline-block px-4 py-2 bg-red-50 border border-red-200 rounded-lg my-3">
              <p className="font-semibold text-red-600">{itemName}</p>
            </div>
          )}
        </div>

        {/* Warning Box */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">
              ⚠️ {getWarningMessage()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-5"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 px-5"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Ya, Hapus
          </Button>
        </div>
      </div>
    </Modal>
  )
}