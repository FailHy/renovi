// src/lib/actions/artikel.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { artikels, users } from '@/lib/db/schema'
import { eq, desc, isNotNull } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function getAllArtikels() {
  try {
    const data = await db
      .select({
        id: artikels.id,
        judul: artikels.judul,
        konten: artikels.konten,
        kategori: artikels.kategori,
        gambar: artikels.gambar,
        published: artikels.published,
        posting: artikels.posting,
        author: {
          nama: users.nama,
        }
      })
      .from(artikels)
      .leftJoin(users, eq(artikels.authorId, users.id))
      .orderBy(desc(artikels.posting))

    return data
  } catch (error) {
    console.error('Error fetching artikels:', error)
    return []
  }
}

export async function getArtikelById(id: string) {
  try {
    const [data] = await db
      .select({
        id: artikels.id,
        judul: artikels.judul,
        konten: artikels.konten,
        kategori: artikels.kategori,
        gambar: artikels.gambar,
        published: artikels.published,
        posting: artikels.posting,
        author: {
          nama: users.nama,
        }
      })
      .from(artikels)
      .leftJoin(users, eq(artikels.authorId, users.id))
      .where(eq(artikels.id, id))

    return data
  } catch (error) {
    console.error('Error fetching artikel:', error)
    return null
  }
}

export async function createArtikel(data: {
  judul: string
  konten: string
  kategori?: string
  gambar?: string
  published: boolean
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error('Unauthorized')
    }

    const [artikel] = await db
      .insert(artikels)
      .values({
        ...data,
        authorId: session.user.id,
        posting: new Date(),
      })
      .returning()

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true, data: artikel }
  } catch (error) {
    console.error('Error creating artikel:', error)
    return { success: false, error: 'Gagal membuat artikel' }
  }
}

export async function updateArtikel(id: string, data: {
  judul?: string
  konten?: string
  kategori?: string
  gambar?: string
  published?: boolean
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error('Unauthorized')
    }

    // Update artikel
    const [artikel] = await db
      .update(artikels)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(artikels.id, id))
      .returning()

    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true, data: artikel }
  } catch (error) {
    console.error('Error updating artikel:', error)
    return { success: false, error: 'Gagal mengupdate artikel' }
  }
}

export async function deleteArtikel(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error('Unauthorized')
    }

    // Ambil data artikel untuk mendapatkan gambar
    const [artikel] = await db
      .select({ gambar: artikels.gambar })
      .from(artikels)
      .where(eq(artikels.id, id))

    // Hapus gambar jika ada
    if (artikel?.gambar) {
      try {
        const filename = artikel.gambar.split('/').pop()
        if (filename) {
          const filePath = join(process.cwd(), 'public', 'uploads', filename)
          if (existsSync(filePath)) {
            await unlink(filePath)
            console.log('🗑️ Gambar artikel berhasil dihapus:', filename)
          }
        }
      } catch (error) {
        console.error('  Error menghapus gambar:', error)
        // Continue anyway
      }
    }

    // Hapus artikel dari database
    await db.delete(artikels).where(eq(artikels.id, id))
    
    revalidatePath('/admin/artikel')
    revalidatePath('/artikel')
    return { success: true }
  } catch (error) {
    console.error('Error deleting artikel:', error)
    return { success: false, error: 'Gagal menghapus artikel' }
  }
}

export async function getKategoriOptions() {
  try {
    const result = await db
      .selectDistinct({ kategori: artikels.kategori })
      .from(artikels)
      .where(isNotNull(artikels.kategori))

    return result.map(item => item.kategori).filter(Boolean) as string[]
  } catch (error) {
    console.error('Error fetching kategori options:', error)
    return []
  }
}