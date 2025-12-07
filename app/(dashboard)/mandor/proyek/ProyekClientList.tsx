// FILE: app/(dashboard)/mandor/proyek/ProyekListClient.tsx
// ========================================
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Search, Filter, FolderKanban } from 'lucide-react'
import Link from 'next/link'

interface Pelanggan {
  id: string
  nama: string
  telpon: string
  email?: string
}

interface Project {
  id: string
  nama: string
  tipeLayanan: string
  deskripsi: string
  alamat: string
  status: string
  progress: number
  pelanggan: Pelanggan
  mulai: string
  selesai?: string
  lastUpdate: string
}

interface ProyekListClientProps {
  projects: Project[]
}

export function ProyekListClient({ projects }: ProyekListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('lastUpdate')

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Perencanaan': 'badge-info',
      'Dalam Progress': 'badge-warning',
      'Selesai': 'badge-success',
      'Dibatalkan': 'badge-danger',
    }
    return variants[status] || 'badge-info'
  }

  // Filter & Search
  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchSearch = 
      project.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.pelanggan.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchStatus = statusFilter === 'all' || project.status === statusFilter

    return matchSearch && matchStatus
  })

  // Sort
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'lastUpdate':
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
      case 'nama':
        return a.nama.localeCompare(b.nama)
      case 'progress':
        return b.progress - a.progress
      case 'mulai':
        return new Date(b.mulai).getTime() - new Date(a.mulai).getTime()
      default:
        return 0
    }
  })

  return (
  <div className="space-y-6">
    {/* Search & Filter Bar - Enhanced */}
    <Card className="mb-6 shadow-md border-0 bg-white">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search - Enhanced */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari proyek, pelanggan, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* Status Filter - Enhanced */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="Dalam Progress">Dalam Progress</option>
              <option value="Perencanaan">Perencanaan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Sort - Enhanced */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="lastUpdate">Update Terbaru</option>
              <option value="nama">Nama A-Z</option>
              <option value="progress">Progress Tertinggi</option>
              <option value="mulai">Tanggal Mulai</option>
            </select>
          </div>
        </div>

        {/* Result Count - Enhanced */}
        <div className="mt-5 pt-5 border-t-2 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <p className="text-sm text-slate-600 font-medium">
              Menampilkan <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold">{sortedProjects.length}</span> dari <span className="font-bold text-slate-900">{projects.length}</span> proyek
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Projects Grid */}
    {sortedProjects.length === 0 ? (
      <Card className="shadow-md border-0">
        <CardContent className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"></div>
              <FolderKanban className="relative w-20 h-20 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery || statusFilter !== 'all' 
                ? 'Tidak ada hasil ditemukan'
                : 'Belum ada proyek'
              }
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Proyek yang ditugaskan akan muncul di sini'
              }
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Reset Filter
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <Link key={project.id} href={`/mandor/proyek/${project.id}`}>
            <Card hover className="h-full group border-0 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-6">
                {/* Header */}
                <div className="mb-5 pb-4 border-b-2 border-slate-100">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.nama}
                    </h3>
                  </div>
                  <span className={`${getStatusBadge(project.status)} text-xs font-semibold px-3 py-1.5 rounded-lg inline-block`}>
                    {project.status}
                  </span>
                </div>

                {/* Service Type with Icon */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-1 border-blue-400 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    {project.tipeLayanan}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                  {project.deskripsi}
                </p>

                {/* Info with Icons */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Pelanggan
                      </span>
                      <span className="font-bold text-slate-900 block truncate text-sm">
                        {project.pelanggan.nama}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Lokasi
                      </span>
                      <span className="text-slate-700 block truncate text-sm font-medium">
                        {project.alamat}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar - Enhanced */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Progress
                    </span>
                    <span className="text-lg font-black text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 relative ${
                        project.progress >= 80 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : project.progress >= 50 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                          : project.progress >= 30
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-rose-500 to-rose-400'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Last Update - Enhanced */}
                <div className="pt-4 border-t-2 border-slate-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-slate-500">
                      Update terakhir: <span className="font-bold text-slate-700">
                        {new Date(project.lastUpdate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )}
  </div>
)
}