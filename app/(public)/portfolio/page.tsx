// FILE: app/(public)/portfolio/page.tsx
// ========================================
import { db } from '@/lib/db'
import { portfolios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/Card'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export default async function PortfolioPage() {
  const publishedPortfolios = await db.query.portfolios.findMany({
    where: eq(portfolios.published, true),
    orderBy: (portfolios, { desc }) => [desc(portfolios.createdAt)],
    with: {
      projek: true,
    },
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">Portfolio Kami</h1>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            Lihat hasil kerja terbaik dari proyek-proyek yang telah kami selesaikan dengan sukses
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="section">
        <div className="container-custom">
          {publishedPortfolios.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Belum ada portfolio yang dipublikasikan
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedPortfolios.map((portfolio) => (
                <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`}>
                  <Card hover className="h-full">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
                      {portfolio.imageUrl?.[0] ? (
                        <img
                          src={portfolio.imageUrl[0]}
                          alt={portfolio.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{portfolio.name}</h3>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3 line-clamp-2">
                        {portfolio.description}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            Kategori:
                          </span>
                          <span className="font-medium">{portfolio.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            Lokasi:
                          </span>
                          <span>{portfolio.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            Durasi:
                          </span>
                          <span>{portfolio.duration}</span>
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