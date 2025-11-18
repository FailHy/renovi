// FILE: app/(public)/artikel/page.tsx
import { db } from '@/lib/db'
import { artikels, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ArtikelPage() {
  const publishedArticles = await db
    .select({
      id: artikels.id,
      judul: artikels.judul,
      konten: artikels.konten,
      gambar: artikels.gambar,
      kategori: artikels.kategori,
      posting: artikels.posting,
      authorName: users.nama,
    })
    .from(artikels)
    .leftJoin(users, eq(artikels.authorId, users.id))
    .where(eq(artikels.published, true))
    .orderBy(desc(artikels.posting))

  // Group articles by category
  const categories = [...new Set(publishedArticles.map(article => article.kategori))].filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm mb-6">
            <BookOpen className="w-5 h-5" />
            <span>Artikel & Tips Renovasi</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Blog Renovasi
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            Temukan tips, inspirasi, dan panduan terbaru seputar renovasi dan konstruksi
          </p>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              <Button
                variant="outline"
                className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-6"
              >
                Semua Kategori
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-6"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Articles Grid */}
          {publishedArticles.length === 0 ? (
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardContent className="text-center py-16">
                <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-2">
                  Belum ada artikel yang dipublikasikan
                </p>
                <p className="text-gray-400 text-sm">
                  Artikel terbaru akan muncul di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedArticles.map((article) => (
                <Link key={article.id} href={`/artikel/${article.id}`}>
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden group h-full">
                    {/* Article Image */}
                    <div className="aspect-video bg-gray-200 rounded-t-2xl overflow-hidden">
                      {article.gambar ? (
                        <img
                          src={article.gambar}
                          alt={article.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <BookOpen className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      {/* Category Badge */}
                      {article.kategori && (
                        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-4">
                          {article.kategori}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {article.judul}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {article.konten.substring(0, 150)}...
                      </p>
                      
                      {/* Meta Information */}
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{article.authorName || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.posting)}</span>
                        </div>
                      </div>

                      {/* Read More CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-primary font-semibold text-sm group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                          Baca Selengkapnya
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {publishedArticles.length > 0 && (
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white rounded-3xl p-12 md:p-16 text-center shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Butuh Konsultasi Renovasi?
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Tim profesional kami siap membantu mewujudkan impian renovasi Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="https://wa.me/6283170619950?text=Halo%20Renovi,%20saya%20ingin%20konsultasi%20tentang%20proyek%20renovasi">
                  <Button 
                    className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group px-8 py-3 h-12 text-lg font-semibold"
                  >
                    Hubungi Kami
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 px-8 py-3 h-12 text-lg font-semibold"
                  >
                    Lihat Portfolio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}