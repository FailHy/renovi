// src/app/artikel/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { artikels, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ArrowLeft, Calendar, User, Tag, BookOpen } from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    id: string
  }>
}

async function getArtikel(id: string) {
  try {
    const [artikel] = await db
      .select({
        id: artikels.id,
        judul: artikels.judul,
        konten: artikels.konten,
        gambar: artikels.gambar,
        kategori: artikels.kategori,
        posting: artikels.posting,
        author: {
          nama: users.nama,
        },
      })
      .from(artikels)
      .leftJoin(users, eq(artikels.authorId, users.id))
      .where(eq(artikels.id, id))

    return artikel
  } catch (error) {
    console.error('Error fetching artikel:', error)
    return null
  }
}

async function getRelatedArticles(currentId: string, kategori: string | null) {
  try {
    const allArticles = await db
      .select({
        id: artikels.id,
        judul: artikels.judul,
        gambar: artikels.gambar,
        kategori: artikels.kategori,
        posting: artikels.posting,
      })
      .from(artikels)
      .orderBy(desc(artikels.posting))
      .limit(6)
    
    let filtered = allArticles.filter(a => a.id !== currentId)
    
    if (kategori) {
      const sameCategory = filtered.filter(a => a.kategori === kategori)
      if (sameCategory.length > 0) {
        return sameCategory.slice(0, 2)
      }
    }

    return filtered.slice(0, 2)
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

export default async function ArtikelDetailPage({ params }: PageProps) {
  try {
    const { id } = await params
    
    console.log('🔄 Fetching artikel with ID:', id)

    const artikel = await getArtikel(id)

    if (!artikel) {
      console.log('❌ Artikel not found for ID:', id)
      notFound()
    }

    console.log('✅ Artikel found:', artikel.judul)

    const relatedArticles = await getRelatedArticles(id, artikel.kategori)

    return (
      <div className="min-h-screen bg-white">
        {/* Simple Header */}
        <div className="border-b bg-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/artikel"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Kembali ke Artikel</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Article - Simplified */}
            <div className="lg:w-2/3">
              <article className="bg-white">
                {/* Compact Header */}
                <div className="mb-6">
                  {artikel.kategori && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-4">
                      {artikel.kategori}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {artikel.judul}
                  </h1>
                </div>

                {/* Compact Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{artikel.author?.nama || 'Admin Renovi'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(artikel.posting).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Optimized Featured Image */}
                {artikel.gambar && (
                  <div className="mb-8 rounded-lg overflow-hidden bg-gray-100">
                    <div className="aspect-video relative">
                      <Image
                        src={artikel.gambar}
                        alt={artikel.judul}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: artikel.konten }}
                  />
                </div>

                {/* Simple Category Footer */}
                {artikel.kategori && (
                  <div className="mt-8 pt-6 border-t">
                    <span className="text-xs font-medium text-gray-500">Kategori:</span>
                    <Link
                      href={`/artikel?kategori=${encodeURIComponent(artikel.kategori)}`}
                      className="ml-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {artikel.kategori}
                    </Link>
                  </div>
                )}
              </article>
            </div>

            {/* Compact Sidebar */}
            <div className="lg:w-1/3">
              <div className="space-y-6 sticky top-8">
                {/* Categories */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">KATEGORI</h3>
                  <div className="space-y-2">
                    <Link 
                      href="/artikel?kategori=Tips Renovasi" 
                      className="block text-blue-600 hover:text-blue-700 text-sm py-1"
                    >
                      Tips Renovasi
                    </Link>
                    {/* Add more categories as needed */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal CTA */}
        <section className="bg-blue-600 text-white py-12 mt-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-xl font-bold mb-2">Butuh Konsultasi Renovasi?</h2>
            <p className="text-blue-100 mb-6 text-sm">
              Tim profesional kami siap membantu Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/kontak"
                className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm"
              >
                Hubungi Kami
              </Link>
              <Link
                href="/portfolio"
                className="inline-block border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition text-sm"
              >
                Lihat Portfolio
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('❌ Error in ArtikelDetailPage:', error)
    notFound()
  }
}