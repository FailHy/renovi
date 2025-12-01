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
    <div>
      {/* Search & Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari proyek, pelanggan, lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
              >
                <option value="all">Semua Status</option>
                <option value="Dalam Progress">Dalam Progress</option>
                <option value="Perencanaan">Perencanaan</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
              >
                <option value="lastUpdate">Update Terbaru</option>
                <option value="nama">Nama A-Z</option>
                <option value="progress">Progress Tertinggi</option>
                <option value="mulai">Tanggal Mulai</option>
              </select>
            </div>
          </div>

          {/* Result Count */}
          <div className="mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Menampilkan {sortedProjects.length} dari {projects.length} proyek
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {sortedProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
              {searchQuery || statusFilter !== 'all' 
                ? 'Tidak ada proyek yang sesuai dengan pencarian'
                : 'Belum ada proyek yang ditugaskan'
              }
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
                className="text-light-primary dark:text-dark-primary hover:underline text-sm mt-2"
              >
                Reset filter
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <Link key={project.id} href={`/mandor/proyek/${project.id}`}>
              <Card hover className="h-full">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                      {project.nama}
                    </h3>
                    <span className={`badge ${getStatusBadge(project.status)} whitespace-nowrap ml-2 text-xs`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Service Type */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {project.tipeLayanan}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2">
                    {project.deskripsi}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">
                        Pelanggan:
                      </span>
                      <span className="ml-2 font-medium">{project.pelanggan.nama}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">
                        Lokasi:
                      </span>
                      <span className="ml-2 line-clamp-1">{project.alamat}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">
                        Progress
                      </span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          project.progress >= 80 
                            ? 'bg-green-500' 
                            : project.progress >= 50 
                            ? 'bg-blue-500' 
                            : project.progress >= 30
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      Update terakhir: {new Date(project.lastUpdate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
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