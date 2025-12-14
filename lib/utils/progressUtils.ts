// lib/utils/progressUtils.ts

/**
 *    Normalize progress value untuk UI display
 * Memastikan nilai selalu dalam range 0-100 dan valid number
 */
export function normalizeProgress(progress: number | null | undefined): number {
  if (progress === null || progress === undefined || isNaN(progress)) {
    return 0
  }
  
  // Clamp antara 0-100
  return Math.max(0, Math.min(100, Math.round(progress)))
}

export function getProgressColor(progress: number): string {
  if (progress >= 81) {
    // 81-100%: Hijau - Hampir selesai / Selesai
    return 'bg-gradient-to-r from-green-500 to-green-600'
  }
  if (progress >= 61) {
    // 61-80%: Biru - Progres baik
    return 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
  if (progress >= 41) {
    // 41-60%: Kuning - Progres sedang
    return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  }
  if (progress >= 21) {
    // 21-40%: Orange - Progres lambat
    return 'bg-gradient-to-r from-orange-400 to-orange-500'
  }
  // 0-20%: Merah - Baru mulai / Sangat lambat
  return 'bg-gradient-to-r from-red-400 to-red-500'
}

/**
 *    Format progress display text
 */
export function formatProgressText(progress: number): string {
  const normalized = normalizeProgress(progress)
  
  if (normalized === 100) return 'Proyek Selesai'
  if (normalized >= 75) return 'Hampir Selesai'
  if (normalized >= 50) return 'Setengah Jalan'
  if (normalized >= 25) return 'Dalam Pengerjaan'
  if (normalized > 0) return 'Baru Dimulai'
  return 'Belum Dimulai'
}