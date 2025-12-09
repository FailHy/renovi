// FILE: components/mandor/ProjectInfoTab.tsx
'use client'

import { Pencil, MapPin, Calendar, User, Phone, Mail, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Project, Milestone } from './type'

interface ProjectInfoTabProps {
  project: Project
  milestones: Milestone[]
  onProgressClick: () => void
}

export function ProjectInfoTab({ project, milestones, onProgressClick }: ProjectInfoTabProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Perencanaan': 'info',
      'Dalam Progress': 'warning',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
    }
    return variants[status] || 'info'
  }

  const completedMilestones = milestones.filter(m => m.status === 'Selesai').length

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Detail Proyek */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">
            Detail Proyek
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* Status & Auto Progress */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Status Proyek</span>
              <Badge variant={getStatusBadge(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-600 block mb-1">Progress Otomatis</span>
              <span className="text-xs text-slate-500 font-medium">
                {completedMilestones} dari {milestones.length} milestone
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Progress Keseluruhan</span>
              <span className="text-lg font-bold text-blue-600">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Informasi Detail */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-xs font-semibold text-slate-600 mb-2 block">
                DESKRIPSI PROYEK
              </label>
              <p className="text-slate-900 leading-relaxed">{project.deskripsi}</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Lokasi Proyek</label>
                <p className="text-slate-900 font-medium">{project.alamat}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tanggal Mulai</label>
                <p className="text-slate-900 font-medium">{formatDate(project.mulai)}</p>
              </div>
            </div>

            {project.selesai && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tanggal Selesai</label>
                  <p className="text-slate-900 font-medium">{formatDate(project.selesai)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informasi Pelanggan */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">
            Informasi Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Pelanggan</label>
              <p className="text-base font-bold text-slate-900">{project.pelanggan.nama}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Nomor Telepon</label>
              <p className="text-slate-900 font-semibold">{project.pelanggan.telpon}</p>
            </div>
          </div>

          {project.pelanggan.email && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                <p className="text-slate-900 font-medium">{project.pelanggan.email}</p>
              </div>
            </div>
          )}

          {project.pelanggan.alamat && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Alamat Pelanggan</label>
                <p className="text-slate-900 font-medium">{project.pelanggan.alamat}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}