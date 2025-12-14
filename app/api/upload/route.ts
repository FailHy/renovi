// src/app/api/upload/route.ts
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const oldFilename = formData.get('oldFilename') as string | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diupload' },
        { status: 400 }
      )
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      )
    }

    // Validasi ukuran file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    // HAPUS GAMBAR LAMA JIKA ADA
    if (oldFilename) {
      try {
        const oldFilePath = join(process.cwd(), 'public', 'uploads', oldFilename)
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath)
          console.log('🗑️ Gambar lama berhasil dihapus:', oldFilename)
        }
      } catch (error) {
        console.error('  Error menghapus gambar lama:', error)
        // Continue anyway - tidak perlu gagal jika hapus gagal
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `artikel-${timestamp}-${randomString}.${extension}`

    // Path untuk menyimpan file
    const publicUploadsPath = join(process.cwd(), 'public', 'uploads', filename)
    
    // Simpan file baru
    await writeFile(publicUploadsPath, buffer)
    console.log('   Gambar baru berhasil disimpan:', filename)

    // Return URL yang bisa diakses public
    const imageUrl = `/uploads/${filename}`

    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      message: oldFilename ? 'Gambar berhasil diupdate' : 'Gambar berhasil diupload'
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload' },
      { status: 500 }
    )
  }
}