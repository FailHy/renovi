// FILE: app/(public)/tentang/page.tsx
// ========================================
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Target, Eye, Award, Users, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function TentangPage() {
  const stats = [
    { value: '500+', label: 'Proyek Selesai' },
    { value: '98%', label: 'Kepuasan Klien' },
    { value: '50+', label: 'Tim Profesional' },
    { value: '10+', label: 'Tahun Pengalaman' },
  ]

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Profesional',
      description: 'Tim berpengalaman dan tersertifikasi',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Transparan',
      description: 'Monitoring real-time setiap progres',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Terpercaya',
      description: 'Dipercaya ratusan klien',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'Berkualitas',
      description: 'Material premium & hasil terbaik',
      color: 'from-orange-500 to-orange-600',
    },
  ]

  const features = [
    'Monitoring progres real-time 24/7',
    'Pelacakan material dan anggaran',
    'Komunikasi langsung dengan mandor',
    'Laporan harian dan mingguan',
    'Garansi hasil pengerjaan',
    'Support customer service 24 jam',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm mb-6">
            <Building2 className="w-5 h-5" />
            <span>Tentang Perusahaan</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Tentang Renovi
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            Platform pelacakan progres renovasi dan konstruksi terpercaya di Indonesia
          </p>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Siapa Kami
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Renovi adalah platform inovatif yang menghubungkan pemilik proyek dengan kontraktor profesional. 
              Kami menyediakan sistem monitoring real-time yang transparan, memungkinkan klien untuk memantau 
              setiap detail progres renovasi atau konstruksi mereka kapan saja, di mana saja.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-xl rounded-2xl text-center">
                <CardContent className="p-6">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Visi Kami</h3>
                <p className="text-gray-600 leading-relaxed">
                  Menjadi platform #1 di Indonesia untuk pelacakan dan manajemen proyek renovasi dan konstruksi 
                  yang transparan, efisien, dan terpercaya.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Misi Kami</h3>
                <p className="text-gray-600 leading-relaxed">
                  Memberikan solusi teknologi yang memudahkan monitoring proyek konstruksi, meningkatkan 
                  transparansi, dan membangun kepercayaan antara klien dan kontraktor.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-12 py-28">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Nilai Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Komitmen kami dalam memberikan layanan terbaik untuk kepuasan pelanggan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl text-center group"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-4 text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">{value.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 text-gray-900">
                  Keunggulan Platform Renovi
                </h3>
                <p className="text-gray-600 text-lg">
                  Semua yang Anda butuhkan untuk memantau proyek renovasi dengan mudah
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white rounded-3xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Memulai Proyek Anda?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Hubungi kami sekarang untuk konsultasi gratis dan penawaran terbaik
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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