// Types khusus untuk komponen mandor
export interface Pelanggan {
  id: string
  nama: string
  telpon: string
  email?: string
  alamat?: string
}

// components/mandor/type.ts
export interface Milestone {
  id: string
  nama: string
  deskripsi: string | null  // ✅ Allow null
  tanggal: string
  status: 'Dibatalkan' | 'Belum Dimulai' | 'Dalam Progress' | 'Selesai'
  gambar: string[] | null   // ✅ Allow null
  mulai: Date | null
  selesai: Date | null
  proyekId: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  nama: string
  tipeLayanan: string
  deskripsi: string
  alamat: string
  telpon: string
  status: 'Perencanaan' | 'Dalam Progress' | 'Selesai' | 'Dibatalkan'
  progress: number
  mulai: string
  selesai?: string
  pelanggan: Pelanggan
  budget?: number
  createdAt: string
  updatedAt: string
}

export interface BahanHarian {
  id: string
  nama: string
  deskripsi?: string
  status: 'Digunakan' | 'Sisa' | 'Rusak'
  harga: number
  kuantitas: number
  satuan: string
  tanggal: string | Date
  milestoneId?: string
  gambar?: string[]
  createdAt: string
  updatedAt: string
}

export interface Mandor {
  id: string
  nama: string
}