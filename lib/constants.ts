// lib/constants.ts

/**
 * Mendefinisikan tipe layanan yang tersedia di platform.
 * Digunakan untuk dropdown <Select> di form proyek.
 * Berdasarkan `mockProyeks` Anda, kita bisa tambahkan beberapa opsi lain.
 */
export const TIPE_LAYANAN = [
  'Renovasi Rumah',
  'Konstruksi Bangunan',
  'Desain Interior',
  'Perbaikan Atap',
  'Pengecatan',
  'Instalasi Listrik',
  'Instalasi Pipa',
  'Lainnya',
]

/**
 * Mendefinisikan status progres proyek.
 * Digunakan di dropdown <Select> form dan fungsi `getStatusBadge`.
 * Dibuat sebagai object agar mudah dikelola dan direferensikan.
 */
export const PROJECT_STATUS = {
  PERENCANAAN: 'Perencanaan',
  PROGRESS: 'Dalam Progress',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
}