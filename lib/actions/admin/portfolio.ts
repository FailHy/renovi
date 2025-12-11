'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { portfolios, projeks, users } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET: Mengambil semua proyek yang sudah SELESAI.
 * Termasuk yang belum masuk ke tabel portfolio.
 */
export async function getAdminPortfolios() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized', data: [] }
    }

    // 1. Ambil semua proyek yang statusnya 'Selesai'
    // Ini adalah "Source of Truth" yang benar
    const completedProjects = await db.query.projeks.findMany({
      where: eq(projeks.status, 'Selesai'),
      orderBy: [desc(projeks.lastUpdate)],
      with: {
        pelanggan: true,
        // Join ke portfolio untuk cek apakah sudah ada datanya
        portfolio: true 
      }
    })

    // 2. Format data agar mudah dibaca UI
    const formattedData = completedProjects.map(proyek => {
      // Cek apakah sudah ada di tabel portfolio
      const existingPortfolio = proyek.portfolio

      return {
        // Data Proyek (Selalu ada)
        proyekId: proyek.id,
        proyekNama: proyek.nama,
        proyekDeskripsi: proyek.deskripsi,
        proyekLokasi: proyek.alamat,
        proyekKategori: proyek.tipeLayanan,
        clientNama: proyek.pelanggan.nama,
        tanggalSelesai: proyek.selesai || proyek.lastUpdate,
        gambarProyek: proyek.gambar || [],
        
        // Data Portfolio (Bisa null jika belum dibuat)
        portfolioId: existingPortfolio?.id || null,
        isPublished: existingPortfolio?.published || false,
        isCreated: !!existingPortfolio, // Helper flag
        
        // Data Portfolio spesifik (jika ada)
        portfolioDesc: existingPortfolio?.description || proyek.deskripsi,
        portfolioImages: existingPortfolio?.imageUrl || proyek.gambar || []
      }
    })

    return { success: true, data: formattedData }
  } catch (error) {
    console.error('Error fetching admin portfolios:', error)
    return { success: false, error: 'Gagal memuat data portfolio', data: [] }
  }
}

/**
 * ACTION: Toggle Publish / Create Portfolio
 * Jika belum ada di tabel portfolio -> Buat baru (Insert)
 * Jika sudah ada -> Update status published
 */
export async function togglePortfolioStatus(proyekId: string, currentStatus: boolean) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Cek apakah sudah ada di portfolio
    const existing = await db.query.portfolios.findFirst({
      where: eq(portfolios.proyekId, proyekId)
    })

    if (existing) {
      // KASUS 1: Sudah ada, tinggal update status
      await db.update(portfolios)
        .set({ 
          published: !currentStatus,
          updatedAt: new Date()
        })
        .where(eq(portfolios.id, existing.id))
    } else {
      // KASUS 2: Belum ada, Buat baru (Auto-Create dari data proyek)
      const project = await db.query.projeks.findFirst({
        where: eq(projeks.id, proyekId),
        with: { pelanggan: true }
      })

      if (!project) return { success: false, error: 'Proyek tidak ditemukan' }

      // Hitung durasi kasar (opsional)
      const duration = project.mulai && project.selesai 
        ? Math.ceil((new Date(project.selesai).getTime() - new Date(project.mulai).getTime()) / (1000 * 60 * 60 * 24)) + ' Hari'
        : 'Estimasi'

      await db.insert(portfolios).values({
        id: uuidv4(),
        proyekId: project.id,
        name: project.nama,
        client: project.pelanggan.nama,
        location: project.alamat,
        category: project.tipeLayanan,
        duration: duration,
        completedDate: project.selesai || new Date(),
        description: project.deskripsi, // Default pakai deskripsi proyek
        imageUrl: project.gambar || [], // Default pakai gambar proyek
        published: true, // Langsung publish jika admin klik "Publish"
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    revalidatePath('/admin/portfolio')
    revalidatePath('/portfolio') // Halaman public
    
    return { success: true }
  } catch (error) {
    console.error('Error toggling portfolio:', error)
    return { success: false, error: 'Gagal update status portfolio' }
  }
}