'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/mandorUtils'
import { toast } from 'react-hot-toast'
import type { Milestone } from './types'

interface MilestoneTabProps {
  milestones: Milestone[]
  proyekId: string
  onAddMilestone: () => void
  onEditMilestone: (milestone: Milestone) => void
  onDeleteMilestone: (milestone: Milestone) => void
  onRefresh?: () => void
}

export function MilestoneTab({ 
  milestones: initialMilestones, 
  proyekId,
  onAddMilestone, 
  onEditMilestone, 
  onDeleteMilestone,
  onRefresh
}: MilestoneTabProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  
  // Sync with initialMilestones when they change
  useEffect(() => {
    setMilestones(initialMilestones)
  }, [initialMilestones])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selesai': return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'Dalam Progress': return <Clock className="w-4 h-4 text-amber-600" />
      case 'Belum Dimulai': return <Clock className="w-4 h-4 text-slate-400" />
      case 'Dibatalkan': return <XCircle className="w-4 h-4 text-rose-600" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Belum Dimulai': 'bg-slate-100 text-slate-700 border border-slate-200',
      'Dalam Progress': 'bg-amber-100 text-amber-700 border border-amber-200',
      'Selesai': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'Dibatalkan': 'bg-rose-100 text-rose-700 border border-rose-200',
    }
    return colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200'
  }

  const statusOptions = [
    { value: 'Belum Dimulai', label: 'Belum Dimulai', icon: '⏳', color: 'slate' },
    { value: 'Dalam Progress', label: 'Dalam Progress', icon: '🚧', color: 'amber' },
    { value: 'Selesai', label: 'Selesai', icon: '  ', color: 'emerald' },
    { value: 'Dibatalkan', label: 'Dibatalkan', icon: '❌', color: 'rose' }
  ]

  // Update status dengan sync langsung ke UI
  const handleQuickUpdateStatus = async (milestoneId: string, newStatus: string) => {
    const originalMilestones = [...milestones]
    const originalStatus = milestones.find(m => m.id === milestoneId)?.status
    
    // Langsung update UI
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId 
        ? { 
            ...m, 
            status: newStatus,
            ...(newStatus === 'Selesai' && { selesai: new Date().toISOString() }),
            ...(newStatus === 'Dalam Progress' && !m.mulai && { mulai: new Date().toISOString() })
          }
        : m
    ))
    
    setUpdatingStatus(milestoneId)

    try {
      // Import dengan dynamic import
      const { updateMilestoneStatus } = await import('@/lib/actions/mandor/milestone')
      const result = await updateMilestoneStatus(milestoneId, newStatus as any)
      
      if (result.success) {
        toast.success(`✓ Status berhasil diubah menjadi "${newStatus}"`)
        
        // Refresh data dari server untuk sinkronisasi
        if (onRefresh) {
          setTimeout(() => {
            onRefresh()
          }, 500)
        }
        
      } else {
        toast.error(result.error || 'Gagal mengupdate status')
        // Rollback jika gagal
        setMilestones(originalMilestones)
      }
    } catch (error) {
      console.error('Error updating milestone status:', error)
      toast.error('Terjadi kesalahan saat mengupdate status')
      // Rollback jika error
      setMilestones(originalMilestones)
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Calculate progress statistics
  const calculateProgress = () => {
    const total = milestones.length
    const selesai = milestones.filter(m => m.status === 'Selesai').length
    const progress = total > 0 ? Math.round((selesai / total) * 100) : 0
    
    return { total, selesai, progress }
  }

  const progressStats = calculateProgress()

  return (
    <div className="space-y-6">
      {/* Header dengan Progress Stats */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900">Milestone Proyek</h3>
            <p className="text-slate-600 mt-1 text-sm">
              Kelola tahapan pengerjaan proyek
            </p>
          </div>
          
          {/* Progress Stats */}
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-200">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {progressStats.progress}%
                </div>
                <div className="text-xs text-slate-500 font-medium">Progress</div>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {progressStats.selesai}/{progressStats.total}
                </div>
                <div className="text-xs text-slate-500 font-medium">Selesai</div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onAddMilestone}
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Milestone</span>
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusOptions.map((status) => {
          const count = milestones.filter(m => m.status === status.value).length
          return (
            <Card key={status.value} className="bg-white border-0 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">{status.label}</p>
                    <span className="text-2xl">{status.icon}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">{count}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Milestone List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Belum ada milestone
              </h4>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                Tambahkan milestone pertama untuk melacak progress proyek Anda.
              </p>
              <Button 
                onClick={onAddMilestone} 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Milestone Pertama</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestones.map((milestone) => {
            const isUpdating = updatingStatus === milestone.id
            
            return (
              <Card 
                key={milestone.id} 
                className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    {/* Header dengan Title dan Status Badge */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-base md:text-lg text-slate-900 flex-1">
                          {milestone.nama}
                        </h4>
                        {isUpdating && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="font-medium">Mengupdate...</span>
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(milestone.status)}>
                        <div className="flex items-center gap-1.5 font-semibold text-xs px-1 py-0.5">
                          {getStatusIcon(milestone.status)}
                          {milestone.status}
                        </div>
                      </Badge>
                    </div>

                    {/* Deskripsi */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {milestone.deskripsi}
                    </p>

                    {/* Quick Status Update */}
                    <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200">
                      <label className="text-xs font-semibold text-slate-600 mb-2 md:mb-3 block">
                        UBAH STATUS
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => {
                          const isActive = milestone.status === option.value
                          const bgColor = {
                            slate: 'bg-slate-100 border-slate-300',
                            amber: 'bg-amber-100 border-amber-300',
                            emerald: 'bg-emerald-100 border-emerald-300',
                            rose: 'bg-rose-100 border-rose-300'
                          }[option.color] || 'bg-slate-100'
                          
                          const textColor = {
                            slate: 'text-slate-700',
                            amber: 'text-amber-700',
                            emerald: 'text-emerald-700', 
                            rose: 'text-rose-700'
                          }[option.color] || 'text-slate-700'
                          
                          const borderColor = {
                            slate: 'border-slate-500',
                            amber: 'border-amber-500',
                            emerald: 'border-emerald-500',
                            rose: 'border-rose-500'
                          }[option.color] || 'border-slate-500'

                          return (
                            <button
                              key={option.value}
                              onClick={() => handleQuickUpdateStatus(milestone.id, option.value)}
                              disabled={isUpdating}
                              className={`
                                relative p-2 md:p-3 rounded-lg border-2 font-semibold text-xs transition-all duration-200
                                ${isActive 
                                  ? `${bgColor} ${borderColor} ${textColor} shadow-sm` 
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }
                                ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-lg md:text-xl">{option.icon}</span>
                                <span className="text-xs leading-tight text-center">{option.label}</span>
                              </div>
                              {isActive && (
                                <div className={`absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 ${
                                  option.color === 'slate' ? 'bg-slate-500' :
                                  option.color === 'amber' ? 'bg-amber-500' :
                                  option.color === 'emerald' ? 'bg-emerald-500' :
                                  'bg-rose-500'
                                } rounded-full flex items-center justify-center`}>
                                  <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Dates Info */}
                    <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-600 block mb-1">Target</span>
                          <p className="font-semibold text-slate-900 text-sm">
                            {formatDate(milestone.tanggal)}
                          </p>
                        </div>
                      </div>
                      
                      {milestone.mulai && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-slate-600 block mb-1">Mulai</span>
                            <p className="font-semibold text-slate-900 text-sm">
                              {formatDate(milestone.mulai)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {milestone.selesai && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-slate-600 block mb-1">Selesai</span>
                            <p className="font-semibold text-slate-900 text-sm">
                              {formatDate(milestone.selesai)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button
                        variant="outline"
                        onClick={() => onEditMilestone(milestone)}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-500 font-semibold transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-rose-600 border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-500 flex items-center justify-center gap-2 font-semibold transition-all"
                        onClick={() => onDeleteMilestone(milestone)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm">
              Tips Menggunakan Milestone
            </h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Klik tombol status untuk update cepat - perubahan langsung terlihat</li>
              <li>• Progress proyek otomatis terhitung realtime dari milestone yang selesai</li>
              <li>• Status akan otomatis tersimpan ke database</li>
              <li>• Setelah edit nama, halaman akan otomatis refresh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}