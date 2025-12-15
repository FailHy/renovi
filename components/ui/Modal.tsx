// ========================================
'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  noPadding?: boolean
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300',
          'border border-gray-100',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 group"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
              </button>
            )}
          </div>
        )}
        
        {/* Close button when no title */}
        {!title && showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110 group"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        )}
        
        {/* Content with scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Optional: Modal Sections for better structure
export function ModalHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('border-b border-gray-200 px-6 py-4 bg-gray-50', className)}>
      {children}
    </div>
  )
}

export function ModalBody({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

export function ModalFooter({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn('border-t border-gray-200 px-6 py-4 bg-gray-50', className)}>
      <div className="flex items-center justify-end gap-3">
        {children}
      </div>
    </div>
  )
}

// Optional: Confirmation Modal Variant
export function ConfirmationModal({
  isOpen,
  onClose,
  title = "Konfirmasi",
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal", 
  onConfirm,
  variant = "default",
  isLoading = false
}: {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: 'default' | 'danger'
  isLoading?: boolean
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <ModalBody>
        <p className="text-gray-600 text-center">{message}</p>
      </ModalBody>
      <ModalFooter>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50",
            variant === 'danger' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-primary hover:bg-primary/90'
          )}
        >
          {isLoading ? 'Memproses...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  )
}