'use client'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  currentProgress: number
  newProgress: number
  setNewProgress: (progress: number) => void
  onUpdate: () => void
}

export function ProgressModal({
  isOpen,
  onClose,
  currentProgress,
  newProgress,
  setNewProgress,
  onUpdate
}: ProgressModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Progress Proyek"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Progress saat ini: <span className="font-bold text-blue-600">{currentProgress}%</span>
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
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Button>
          <Button 
            onClick={onUpdate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Update Progress
          </Button>
        </div>
      </div>
    </Modal>
  )
}