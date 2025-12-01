// FILE: lib/utils/mandor-utils.ts
// ========================================
// Helper functions untuk Mandor features

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date to Indonesian format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d)
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Calculate days between two dates
 */
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get days until target date
 */
export function getDaysUntil(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const now = new Date()
  const diffTime = target.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if date is overdue
 */
export function isOverdue(targetDate: string | Date): boolean {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  return target < new Date()
}

/**
 * Get status badge variant based on status
 */
export function getStatusBadgeVariant(
  status: string
): 'info' | 'warning' | 'success' | 'danger' {
  const variants: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    'Perencanaan': 'info',
    'Belum Dimulai': 'info',
    'Dalam Progress': 'warning',
    'Selesai': 'success',
    'Dibatalkan': 'danger',
    'Rusak': 'danger',
    'Digunakan': 'success',
    'Sisa': 'warning'
  }
  return variants[status] || 'info'
}

/**
 * Get progress bar color based on percentage
 */
export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 30) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Get health score color
 */
export function getHealthColor(score: string): string {
  const colors: Record<string, string> = {
    'Baik': 'text-green-600',
    'Cukup': 'text-yellow-600',
    'Perlu Perhatian': 'text-red-600'
  }
  return colors[score] || 'text-gray-600'
}

/**
 * Calculate milestone completion percentage
 */
export function calculateMilestoneCompletion(
  completed: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Calculate expense total
 */
export function calculateExpenseTotal(
  harga: number,
  kuantitas: number
): number {
  return harga * kuantitas
}

/**
 * Group expenses by status
 */
export function groupExpensesByStatus<T extends { status: string }>(
  expenses: T[]
): Record<string, T[]> {
  return expenses.reduce((acc, expense) => {
    if (!acc[expense.status]) {
      acc[expense.status] = []
    }
    acc[expense.status].push(expense)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Calculate total expenses from array
 */
export function calculateTotalExpenses<T extends { harga: number; kuantitas: number }>(
  expenses: T[]
): number {
  return expenses.reduce((total, expense) => {
    return total + (expense.harga * expense.kuantitas)
  }, 0)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get relative time (e.g., "2 hari yang lalu")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`
  return `${Math.floor(diffDays / 365)} tahun yang lalu`
}

/**
 * Validate progress value (0-100)
 */
export function validateProgress(progress: number): boolean {
  return progress >= 0 && progress <= 100 && !isNaN(progress)
}

/**
 * Validate price/quantity
 */
export function validatePositiveNumber(value: number): boolean {
  return value > 0 && !isNaN(value)
}

/**
 * Parse form data to numbers
 */
export function parseFormNumber(value: string | FormDataEntryValue | null): number {
  if (!value) return 0
  const num = typeof value === 'string' ? parseFloat(value) : 0
  return isNaN(num) ? 0 : num
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Sort projects by priority
 * Priority: 1. Perlu Perhatian, 2. Dalam Progress, 3. Others
 */
export function sortProjectsByPriority<T extends { 
  status: string
  progress: number
  lastUpdate: string | Date
}>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    // Calculate days since update
    const daysA = getDaysBetween(a.lastUpdate, new Date())
    const daysB = getDaysBetween(b.lastUpdate, new Date())
    
    // Priority 1: Projects needing attention (not updated > 7 days)
    if (daysA > 7 && daysB <= 7) return -1
    if (daysA <= 7 && daysB > 7) return 1
    
    // Priority 2: In progress projects
    const isAInProgress = a.status === 'Dalam Progress'
    const isBInProgress = b.status === 'Dalam Progress'
    if (isAInProgress && !isBInProgress) return -1
    if (!isAInProgress && isBInProgress) return 1
    
    // Priority 3: Lower progress first (needs more work)
    if (isAInProgress && isBInProgress) {
      return a.progress - b.progress
    }
    
    // Default: Most recently updated
    const dateA = typeof a.lastUpdate === 'string' ? new Date(a.lastUpdate) : a.lastUpdate
    const dateB = typeof b.lastUpdate === 'string' ? new Date(b.lastUpdate) : b.lastUpdate
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Filter projects by search query
 */
export function filterProjects<T extends {
  nama: string
  deskripsi?: string
  alamat?: string
}>(projects: T[], searchQuery: string): T[] {
  if (!searchQuery) return projects
  
  const query = searchQuery.toLowerCase()
  return projects.filter(project => 
    project.nama.toLowerCase().includes(query) ||
    project.deskripsi?.toLowerCase().includes(query) ||
    project.alamat?.toLowerCase().includes(query)
  )
}

/**
 * Get satuan options for expenses
 */
export function getSatuanOptions() {
  return [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'ton', label: 'Ton' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'm2', label: 'Meter Persegi (m²)' },
    { value: 'm3', label: 'Meter Kubik (m³)' },
    { value: 'buah', label: 'Buah' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'set', label: 'Set' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'galon', label: 'Galon' },
    { value: 'zak', label: 'Zak/Sak' },
    { value: 'batang', label: 'Batang' },
    { value: 'lembar', label: 'Lembar' },
    { value: 'roll', label: 'Roll' },
    { value: 'dus', label: 'Dus/Box' }
  ]
}

/**
 * Validate date is not in the past
 */
export function isValidFutureDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: Array<{ key: keyof T; label: string }>
): void {
  const csvContent = [
    // Header row
    headers.map(h => h.label).join(','),
    // Data rows
    ...data.map(row =>
      headers.map(h => {
        const value = row[h.key]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[monthIndex]
}

/**
 * Format number with thousand separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}