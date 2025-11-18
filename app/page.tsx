import Link from 'next/link'
import { ArrowRight, CheckCircle2, Building2, Hammer, PaintBucket, Users, Star, TrendingUp, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { db } from '@/lib/db'
import { portfolios, artikels, testimonis } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { CTAButtons } from '@/components/ui/CTAButton'

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
      icon: <Building2 className="w-10 h-10" />,
      title: 'Renovasi Rumah',
      description: 'Layanan renovasi rumah lengkap dengan monitoring real-time dan jaminan kualitas terbaik',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Hammer className="w-10 h-10" />,
      title: 'Konstruksi Bangunan',
      description: 'Pembangunan dari nol dengan sistem pelacakan progres dan material berkualitas',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <PaintBucket className="w-10 h-10" />,
      title: 'Desain Interior',
      description: 'Desain interior modern dan fungsional sesuai dengan kebutuhan dan gaya hidup Anda',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Monitoring Real-time',
      desc: 'Pantau progres setiap saat'
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'Pelacakan Bahan',
      desc: 'Transparansi penggunaan material'
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Milestone Detail',
      desc: 'Laporan tahapan yang jelas'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Komunikasi Langsung',
      desc: 'Chat dengan mandor kapan saja'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Garansi Kualitas',
      desc: 'Jaminan hasil memuaskan'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Tepat Waktu',
      desc: 'Komitmen deadline proyek'
    },
  ]

  const stats = [
    { value: '500+', label: 'Proyek Selesai' },
    { value: '98%', label: 'Kepuasan Klien' },
    { value: '50+', label: 'Tim Profesional' },
    { value: '10+', label: 'Tahun Pengalaman' },
  ]

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-secondary text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 py-20 md:py-15">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Shield className="w-4 h-4" />
                <span>Terpercaya & Bersertifikat</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Renovasi &
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Konstruksi Transparan
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Platform pelacakan progres renovasi yang memudahkan Anda monitoring setiap detail proyek secara real-time dengan teknologi modern
              </p>
              
          <div className="flex flex-wrap gap-6">
            <CTAButtons/>
          </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-40 h-40 text-white/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Grid */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Keunggulan Kami
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Mengapa Pilih Renovi?
            </h2>
            <p className="text-xl text-gray-600">
              Platform modern dengan fitur lengkap untuk memastikan proyek Anda berjalan lancar dan transparan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Cards with Gradient */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Layanan Profesional
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Layanan Kami</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Berbagai layanan profesional untuk mewujudkan hunian impian Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden"
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <Link href="/layanan" className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    Pelajari Lebih Lanjut
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

            <div className="flex flex-wrap gap-4 justify-center py-12">
            <Link href="/layanan">
                <Button  
                  className="bg-primary bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg flex items-center justify-center gap-2 min-h-12 px-6 py-3"
                >
                  Lihat Layanan Kami
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Section - Enhanced */}
      {latestPortfolios.length > 0 && (
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Karya Terbaik Kami
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Portfolio Kami</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Lihat hasil kerja terbaik dari proyek-proyek yang telah kami selesaikan dengan sempurna
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latestPortfolios.map((portfolio) => (
                <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`}>
                  <div className="group relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                      {portfolio.imageUrl?.[0] ? (
                        <img
                          src={portfolio.imageUrl[0]}
                          alt={portfolio.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900">
                        {portfolio.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                        {portfolio.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {portfolio.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4" />
                          {portfolio.location}
                        </span>
                        <span className="text-primary font-semibold group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                          Lihat Detail
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center py-12">
              <Link href="/portfolio">
                <Button  
                  className="bg-primary bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg flex items-center justify-center gap-2 min-h-12 px-6 py-3"
                >
                  Lihat Portfolio Lengkap
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - Premium Cards */}
      {approvedTestimonis.length > 0 && (
        <section className="py-20 md:py-32 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Testimoni Klien
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Apa Kata Mereka?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Kepuasan dan kepercayaan klien adalah prioritas utama kami
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {approvedTestimonis.map((testimoni) => (
                <div
                  key={testimoni.id}
                  className="group relative bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 text-6xl text-primary/10 font-serif">"</div>
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimoni.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-600 mb-6 italic leading-relaxed relative z-10">
                    "{testimoni.komentar}"
                  </p>

                  {/* User Info */}
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimoni.user.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimoni.user.nama}</p>
                      <p className="text-sm text-gray-600">
                        {testimoni.projek.nama}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Bold & Eye-catching */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary via-primary/95 to-secondary text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Siap Mewujudkan
              <span className="block">Proyek Impian Anda?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">
              Hubungi kami sekarang untuk konsultasi gratis dan dapatkan penawaran terbaik untuk proyek renovasi Anda
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="https://wa.me/6283170619950?text=Halo%20Renovi,%20saya%20ingin%20konsultasi%20tentang%20proyek%20renovasi">
                    <Button 
                      className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group flex items-center justify-center gap-2 px-6 py-3 h-12"
                    >
                      Hubungi Kami Sekarang
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}