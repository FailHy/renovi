// FILE: app/(public)/artikel/[id]/page.tsx
import { db } from '@/lib/db'
import { artikels, users } from '@/lib/db/schema'
import { eq, desc, and, ne } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, User, ArrowLeft, Share2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    id: string
  }
}

export default async function ArtikelDetailPage({ params }: Props) {
  // Validasi params.id
  if (!params.id) {
    notFound()
  }

  try {
    // Query artikel dengan join manual
    const articleResult = await db
      .select({
        id: artikels.id,
        authorId: artikels.authorId,
        judul: artikels.judul,
        konten: artikels.konten,
        gambar: artikels.gambar,
        kategori: artikels.kategori,
        published: artikels.published,
        posting: artikels.posting,
        createdAt: artikels.createdAt,
        updatedAt: artikels.updatedAt,
        authorName: users.nama,
        authorEmail: users.email,
      })
      .from(artikels)
      .leftJoin(users, eq(artikels.authorId, users.id))
      .where(eq(artikels.id, params.id))
      .limit(1)

    const article = articleResult[0]

    if (!article || !article.published) {
      notFound()
    }

    // Get related articles
    const relatedArticles = await db
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
      .where(
        and(
          eq(artikels.published, true),
          ne(artikels.id, params.id)
        )
      )
      .orderBy(desc(artikels.posting))
      .limit(3)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/artikel">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Artikel
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <article className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Article Header */}
              <div className="text-center mb-12">
                {article.kategori && (
                  <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    {article.kategori}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                  {article.judul}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-600 mb-8">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{article.authorName || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(article.posting)}</span>
                  </div>
                </div>

                {/* Featured Image */}
                {article.gambar && (
                  <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-8">
                    <img
                      src={article.gambar}
                      alt={article.judul}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Article Content */}
              <Card className="border-0 shadow-xl rounded-2xl">
                <CardContent className="p-8 md:p-12">
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: article.konten }}
                  />
                  
                  {/* Share Section */}
                  <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">Bagikan artikel ini:</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-gray-200">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Artikel Terkait</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Temukan lebih banyak tips dan inspirasi renovasi
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/artikel/${relatedArticle.id}`}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                      <div className="aspect-video bg-gray-200 rounded-t-2xl overflow-hidden">
                        {relatedArticle.gambar ? (
                          <img
                            src={relatedArticle.gambar}
                            alt={relatedArticle.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-bold mb-2 text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedArticle.judul}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {relatedArticle.konten.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(relatedArticle.posting)}</span>
                          <span className="text-primary font-semibold">Baca →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    notFound()
  }
}