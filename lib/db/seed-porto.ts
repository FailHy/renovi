// FILE: lib/db/seed-portfolio.ts
import { db } from '@/lib/db'
import { portfolios, projeks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function seedPortfolio() {
  console.log('🌱 Starting portfolio seed...')
  
  try {
    // Ambil beberapa proyek yang sudah ada untuk dijadikan portfolio
    const existingProyek = await db.query.projeks.findMany({
      limit: 5
    })

    if (existingProyek.length === 0) {
      console.log('❌ No projects found. Please seed projects first.')
      return
    }

    console.log(`📁 Found ${existingProyek.length} projects to convert to portfolio`)

    // Data portfolio sample
    const portfolioData = [
      {
        proyek_id: existingProyek[0].id,
        name: 'Renovasi Rumah Modern Minimalis',
        client: 'Bapak Ahmad',
        location: 'Pekanbaru, Riau',
        category: 'Renovasi Rumah',
        duration: '3 Bulan',
        completed_date: new Date('2024-06-15'),
        description: 'Renovasi lengkap rumah dengan konsep modern minimalis, meliputi pembenahan struktur, pengecatan ulang, dan penataan interior.',
        image_url: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500'
        ],
        published: true
      },
      {
        proyek_id: existingProyek[1]?.id,
        name: 'Pembangunan Ruko 2 Lantai',
        client: 'CV. Maju Jaya',
        location: 'Panam, Pekanbaru',
        category: 'Bangun Baru',
        duration: '6 Bulan',
        completed_date: new Date('2024-08-20'),
        description: 'Pembangunan ruko komersial 2 lantai dengan desain modern dan fasilitas lengkap untuk usaha retail.',
        image_url: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
          'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=500'
        ],
        published: true
      },
      {
        proyek_id: existingProyek[2]?.id,
        name: 'Renovasi Kantor Startup',
        client: 'PT. Tech Innovation',
        location: 'Sudirman, Jakarta',
        category: 'Renovasi Komersial',
        duration: '2 Bulan',
        completed_date: new Date('2024-05-10'),
        description: 'Transformasi ruang kantor menjadi workspace yang modern, ergonomis, dan mendukung kreativitas tim.',
        image_url: [
          'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500'
        ],
        published: true
      }
    ]

    // Filter data yang memiliki proyek_id valid
    const validPortfolioData = portfolioData.filter(item => item.proyek_id)

    console.log('📝 Seeding portfolio...')
    
    let createdCount = 0
    let skippedCount = 0

    console.log(`🎉 Portfolio seed completed! Created: ${createdCount}, Skipped: ${skippedCount}`)
    
  } catch (error) {
    console.error('❌ Portfolio seed failed:', error)
    throw error
  }
}

// Jalankan seed
seedPortfolio()