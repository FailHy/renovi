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
  milestone?: any; // Add the milestone property here
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
  const defaultDescription = 
  itemType === 'bahan' 
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
    size="sm"
  >
    <div className="space-y-5 px-2 py-1">
      {/* Icon Warning */}
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-3">
        <div className="space-y-1">
          <h3 className="text-basef font-semibold text-gray-900">
            {description || defaultDescription}
          </h3>
          
          {itemName && (
            <div className="inline-flex items-center justify-center px-4 py-2.5 bg-red-50 rounded-lg border border-red-100 mt-2">
              <span className="font-bold text-red-700 text-sm">{itemName}</span>
            </div>
          )}
        </div>

        {/* Warning Message */}
        <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 leading-relaxed text-left">
              {getWarningMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          Batal
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isLoading}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 min-w-[100px]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menghapus...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Ya, Hapus</span>
            </>
          )}
        </Button>
      </div>
    </div>
  </Modal>
)
}