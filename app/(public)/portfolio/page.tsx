// FILE: app/(public)/portfolio/page.tsx
// ========================================
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { Building2, MapPin, Calendar, Tag, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function PortfolioPage() {
  const publishedPortfolios = await db.query.portfolios.findMany({
    where: eq(portfolios.published, true),
    orderBy: (portfolios, { desc }) => [desc(portfolios.createdAt)],
    with: {
      projek: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm mb-6">
          <Award className="w-5 h-5" />
          <span>Portfolio Unggulan</span>
        </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Portfolio Kami
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            Lihat hasil kerja terbaik dari proyek-proyek yang telah kami selesaikan dengan sukses
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {publishedPortfolios.length === 0 ? (
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardContent className="text-center py-16">
                <Building2 className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-2">
                  Belum ada portfolio yang dipublikasikan
                </p>
                <p className="text-gray-400 text-sm">
                  Portfolio yang selesai akan muncul di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedPortfolios.map((portfolio) => (
                <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`}>
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden group h-full">
                    {/* Image */}
                    <div className="aspect-video bg-gray-200 rounded-t-2xl overflow-hidden">
                      {portfolio.imageUrl?.[0] ? (
                        <img
                          src={portfolio.imageUrl[0]}
                          alt={portfolio.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Building2 className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors leading-tight">
                        {portfolio.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {portfolio.description}
                      </p>
                      
                      {/* Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <div className="flex justify-between flex-1">
                            <span className="text-gray-600">Kategori:</span>
                            <span className="font-semibold text-gray-900">{portfolio.category}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div className="flex justify-between flex-1">
                            <span className="text-gray-600">Lokasi:</span>
                            <span className="text-gray-900">{portfolio.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="flex justify-between flex-1">
                            <span className="text-gray-600">Durasi:</span>
                            <span className="text-gray-900">{portfolio.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Details CTA */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold text-sm group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                            Lihat Detail Proyek
                            <Building2 className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}