import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { portfolios, projeks, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Ambil data secara FLAT (datar) agar type inference Drizzle bekerja dengan benar
    const rawPortfolios = await db
      .select({
        id: portfolios.id,
        proyekId: portfolios.proyekId,
        name: portfolios.name,
        client: portfolios.client,
        location: portfolios.location,
        category: portfolios.category,
        duration: portfolios.duration,
        completedDate: portfolios.completedDate,
        description: portfolios.description,
        imageUrl: portfolios.imageUrl,
        published: portfolios.published,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
        // Ambil data relasi sebagai kolom flat dengan alias
        proyekNama: projeks.nama,
        proyekStatus: projeks.status,
        pelangganNama: users.nama
      })
      .from(portfolios)
      .leftJoin(projeks, eq(portfolios.proyekId, projeks.id))
      .leftJoin(users, eq(projeks.pelangganId, users.id))
      .orderBy(desc(portfolios.createdAt))

    // 2. Map data flat ke struktur nested yang diinginkan
    const portfoliosData = rawPortfolios.map(item => ({
      id: item.id,
      proyekId: item.proyekId,
      name: item.name,
      client: item.client,
      location: item.location,
      category: item.category,
      duration: item.duration,
      completedDate: item.completedDate,
      description: item.description,
      imageUrl: item.imageUrl,
      published: item.published,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      proyek: {
        nama: item.proyekNama,
        status: item.proyekStatus,
        pelanggan: {
          name: item.pelangganNama
        }
      }
    }))

    return NextResponse.json({ 
      success: true, 
      data: portfoliosData 
    })
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data portfolio' },
      { status: 500 }
    )
  }
}