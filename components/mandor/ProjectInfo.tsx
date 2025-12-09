// FILE: components/mandor/ProjectInfoTab.tsx
'use client'

import { MapPin, Calendar, User, Phone, Mail, Home, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
// import { Progress } from '@/components/ui/Progress'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Project, Milestone } from './type'
import { cn } from '@/lib/utils'

interface ProjectInfoTabProps {
  project: Project
  milestones: Milestone[]
  onProgressClick: () => void
}

type BadgeVariant = 'info' | 'warning' | 'success' | 'danger';

export function ProjectInfoTab({ project, milestones }: ProjectInfoTabProps) {
  
  // Hitung Statistik Milestone
  const totalMilestones = milestones.length
  const cancelledMilestones = milestones.filter(m => m.status === 'Dibatalkan').length
  const completedMilestones = milestones.filter(m => m.status === 'Selesai').length
  const inProgressMilestones = milestones.filter(m => m.status === 'Dalam Progress').length
  
  // Rumus Progress: Abaikan yang dibatalkan
  const effectiveTotal = totalMilestones - cancelledMilestones
  const calculatedProgress = effectiveTotal > 0 
    ? Math.round((completedMilestones / effectiveTotal) * 100) 
    : 0;

  // LOGIKA STATUS DINAMIS
  const getDerivedStatus = (currentStatus: string): string => {
    if (totalMilestones === 0) return currentStatus;

    // 1. Jika semua milestone (selain yang batal) sudah selesai -> Selesai
    if (effectiveTotal > 0 && completedMilestones === effectiveTotal) {
      return 'Selesai';
    }

    // 2. Jika ada yang sedang jalan atau minimal satu selesai -> Dalam Progress
    if (inProgressMilestones > 0 || completedMilestones > 0) {
      return 'Dalam Progress';
    }

    // 3. Jika semua dibatalkan -> Dibatalkan
    if (cancelledMilestones === totalMilestones) {
      return 'Dibatalkan';
    }

    // 4. Sisanya (biasanya semua Belum Dimulai)
    return 'Perencanaan';
  }

  const getStatusBadge = (status: string, progress: number): BadgeVariant => {
    if (progress === 100) return 'success';
    const variants: Record<string, BadgeVariant> = {
      'Perencanaan': 'info',
      'Dalam Progress': 'warning',
      'Selesai': 'success',
      'Dibatalkan': 'danger',
    }
    return variants[status] || 'info';
  }

  const displayStatus = getDerivedStatus(project.status);
  const badgeVariant = getStatusBadge(displayStatus, calculatedProgress);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Kolom 1: Informasi Utama Proyek */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card Status & Progress */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Status Box */}
              <div className="md:col-span-1 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    badgeVariant === 'success' && "bg-green-500",
                    badgeVariant === 'warning' && "bg-yellow-500",
                    badgeVariant === 'danger' && "bg-red-500",
                    badgeVariant === 'info' && "bg-blue-500"
                  )} />
                  <span className="text-sm font-semibold text-slate-600">Status Proyek</span>
                </div>
                <Badge 
                  variant={badgeVariant} 
                  className="px-4 py-2 text-base font-semibold w-full justify-center"
                >
                  {displayStatus}
                </Badge>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Berdasarkan milestone aktif
                </p>
              </div>

              {/* Progress Box */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Progress Pengerjaan</span>
                    <span className={`text-2xl font-bold ${
                      calculatedProgress === 100 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {calculatedProgress}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-700 ease-out rounded-full",
                        calculatedProgress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      )}
                      style={{ width: `${calculatedProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Informasi Detail Proyek */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Detail Proyek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Deskripsi Proyek</label>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-800 leading-relaxed">{project.deskripsi}</p>
              </div>
            </div>

            {/* Grid Informasi */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Lokasi */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Lokasi Proyek</label>
                    <p className="text-sm font-medium text-slate-900 mt-1">{project.alamat}</p>
                  </div>
                </div>
              </div>

              {/* Tanggal Mulai */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tanggal Mulai</label>
                    <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(project.mulai)}</p>
                  </div>
                </div>
              </div>

              {/* Tanggal Selesai (jika ada) */}
              {project.selesai && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tanggal Selesai</label>
                      <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(project.selesai)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistik Proyek */}
            <div className="pt-4 border-t border-slate-200">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  {/* <div className="text-xs text-blue-700 font-medium">Total Milestone</div> */}
                  {/* <div className="text-xl font-bold text-blue-900 mt-1">{totalMilestones}</div> */}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  {/* <div className="text-xs text-green-700 font-medium">Aktif</div>
                  <div className="text-xl font-bold text-green-900 mt-1">{effectiveTotal}</div> */}
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  {/* <div className="text-xs text-amber-700 font-medium">Dalam Progress</div>
                  <div className="text-xl font-bold text-amber-900 mt-1">{inProgressMilestones}</div> */}
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  {/* <div className="text-xs text-red-700 font-medium">Dibatalkan</div>
                  <div className="text-xl font-bold text-red-900 mt-1">{cancelledMilestones}</div> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kolom 2: Informasi Klien */}
      <div className="space-y-6">
        {/* Card Informasi Klien */}
        <Card className="border-0 shadow-lg sticky top-6">
          <CardHeader className="pb-4 border-b border-slate-200">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informasi Klien
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Profil Klien */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {project.pelanggan.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{project.pelanggan.nama}</h3>
                  <Badge variant="info" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                    Klien Utama
                  </Badge>
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">Kontak</h4>
                
                {/* Telepon */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Telepon</div>
                    <div className="text-sm font-medium text-slate-900">{project.pelanggan.telpon}</div>
                  </div>
                </div>

                {/* Email */}
                {project.pelanggan.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Email</div>
                      <div className="text-sm font-medium text-slate-900">{project.pelanggan.email}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Alamat */}
              {project.pelanggan.alamat && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Alamat</h4>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Alamat Lengkap</div>
                      <div className="text-sm text-slate-800 mt-1 leading-relaxed">{project.pelanggan.alamat}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Tambahan */}
              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Terakhir diperbarui: {formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}