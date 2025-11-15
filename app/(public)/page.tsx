import Link from 'next/link'
import { ArrowRight, CheckCircle2, Building2, Hammer, PaintBucket, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { db } from '@/lib/db'
import { portfolios, artikels, testimonis } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export default async function HomePage() {
  // Fetch data untuk homepage
  const [latestPortfolios, latestArtikels, approvedTestimonis] = await Promise.all([
    db.query.portfolios.findMany({
      where: eq(portfolios.published, true),
      orderBy: [desc(portfolios.createdAt)],
      limit: 3,
      with: {
        projek: true,
      },
    }),
    db.query.artikels.findMany({
      where: eq(artikels.published, true),
      orderBy: [desc(artikels.posting)],
      limit: 3,
      with: {
        author: true,
      },
    }),
    db.query.testimonis.findMany({
      where: eq(testimonis.approved, true),
      orderBy: [desc(testimonis.posting)],
      limit: 3,
      with: {
        user: true,
        projek: true,
      },
    }),
  ])

  const services = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Renovasi Rumah',
      description: 'Layanan renovasi rumah lengkap dengan monitoring real-time',
    },
    {
      icon: <Hammer className="w-8 h-8" />,
      title: 'Konstruksi Bangunan',
      description: 'Pembangunan dari nol dengan sistem pelacakan progres',
    },
    {
      icon: <PaintBucket className="w-8 h-8" />,
      title: 'Desain Interior',
      description: 'Desain interior modern sesuai kebutuhan Anda',
    },
  ]

  const features = [
    'Monitoring progres real-time',
    'Pelacakan penggunaan bahan',
    'Laporan milestone detail',
    'Komunikasi langsung dengan mandor',
    'Galeri foto progres harian',
    'Dashboard interaktif',
  ]

  return (
    <div>
      {/* Hero Section */}
      {/* MENGGANTI from-light-primary/dark-primary DENGAN from-primary */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container-custom section">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                Renovasi & Konstruksi Transparan
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Platform pelacakan progres renovasi yang memudahkan Anda monitoring setiap detail proyek secara real-time
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/kontak">
                  {/* MENGGANTI bg-white/text-light-primary DENGAN bg-surface/text-primary */}
                  <Button variant="primary"  className="bg-surface text-primary hover:bg-surface/90">
                    Mulai Proyek
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/portfolio">
                  {/* MENGGANTI border-white/text-white/hover:text-light-primary DENGAN border-surface/text-surface/hover:text-primary */}
                  <Button variant="outline"  className="border-white text-white hover:bg-surface hover:text-primary">
                    Lihat Portfolio
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="w-full h-96 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Building2 className="w-32 h-32 text-white/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mengapa Pilih Renovi?</h2>
            {/* MENGHAPUS dark:text-dark-text-secondary */}
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Platform modern dengan fitur lengkap untuk memastikan proyek Anda berjalan lancar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent>
                  {/* MENGGANTI text-light-primary/dark:text-dark-primary DENGAN text-primary */}
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="font-medium">{feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* MENGGANTI from-light-primary/dark-primary DENGAN from-primary */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Siap Memulai Proyek Anda?</h3>
            <p className="text-xl mb-6 text-white/90">
              Hubungi kami untuk konsultasi gratis dan dapatkan penawaran terbaik
            </p>
            <Link href="/kontak">
              {/* MENGGANTI bg-white/text-light-primary DENGAN bg-surface/text-primary */}
              <Button variant="primary"  className="bg-surface text-primary hover:bg-surface/90">
                Hubungi Kami Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {/* MENGGANTI bg-gray-50 dark:bg-gray-900 DENGAN bg-background */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Layanan Kami</h2>
            {/* MENGHAPUS dark:text-dark-text-secondary */}
            <p className="text-xl text-text-secondary">
              Berbagai layanan profesional untuk kebutuhan konstruksi Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} hover>
                <CardContent className="text-center">
                  {/* MENGGANTI bg-light-primary/10/dark:bg-dark-primary/10 DENGAN bg-primary/10 */}
                  {/* MENGGANTI text-light-primary/dark:text-dark-primary DENGAN text-primary */}
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  {/* MENGHAPUS dark:text-dark-text-secondary */}
                  <p className="text-text-secondary">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/layanan">
              <Button variant="outline">
                Lihat Semua Layanan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      {latestPortfolios.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Portfolio Kami</h2>
              {/* MENGHAPUS dark:text-dark-text-secondary */}
              <p className="text-xl text-text-secondary">
                Lihat hasil kerja terbaik dari proyek-proyek yang telah kami selesaikan
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latestPortfolios.map((portfolio) => (
                <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`}>
                  <Card hover className="h-full">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
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
                    <CardContent>
                      <h3 className="text-xl font-semibold mb-2">{portfolio.name}</h3>
                      {/* MENGHAPUS dark:text-dark-text-secondary */}
                      <p className="text-text-secondary mb-3 line-clamp-2">
                        {portfolio.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        {/* MENGGANTI text-light-primary/dark:text-dark-primary DENGAN text-primary */}
                        <span className="text-primary font-medium">
                          {portfolio.category}
                        </span>
                        {/* MENGHAPUS dark:text-dark-text-secondary */}
                        <span className="text-text-secondary">
                          {portfolio.location}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/portfolio">
                <Button variant="outline">
                  Lihat Semua Portfolio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {latestPortfolios.length > 0 && (
        <section className="section bg-background">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Testimoni Klien</h2>
              <p className="text-xl text-text-secondary">
                Apa kata klien kami tentang layanan Renovi
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {approvedTestimonis.map((testimoni) => (
                <Card key={testimoni.id}>
                  <CardContent>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimoni.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-text-secondary mb-4 italic">
                      "{testimoni.komentar}"
                    </p>
                    <div className="flex items-center gap-3">
                      {/* MENGGANTI bg-light-primary/10/dark:bg-dark-primary/10 DENGAN bg-primary/10 */}
                      {/* MENGGANTI text-light-primary/dark:text-dark-primary DENGAN text-primary */}
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{testimoni.user.nama}</p>
                        <p className="text-sm text-text-secondary">
                          {testimoni.projek.nama}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
