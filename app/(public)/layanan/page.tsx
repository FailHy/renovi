// FILE: app/(public)/layanan/page.tsx
// ========================================
import { Building2, Hammer, PaintBucket, Trees, Store, Home, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const services = [
  {
    icon: <Home className="w-12 h-12" />,
    title: 'Renovasi Rumah',
    description: 'Layanan renovasi rumah lengkap mulai dari dapur, kamar mandi, hingga perombakan total dengan monitoring real-time.',
    features: ['Renovasi Dapur', 'Renovasi Kamar Mandi', 'Renovasi Kamar Tidur', 'Renovasi Total'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Building2 className="w-12 h-12" />,
    title: 'Konstruksi Bangunan',
    description: 'Pembangunan gedung dari nol dengan sistem pelacakan progres yang transparan dan terstruktur.',
    features: ['Rumah Tinggal', 'Ruko', 'Gedung Kantor', 'Gudang'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: <PaintBucket className="w-12 h-12" />,
    title: 'Desain Interior',
    description: 'Jasa desain interior modern dan fungsional sesuai dengan kebutuhan dan budget Anda.',
    features: ['Konsultasi Desain', '3D Visualisasi', 'Pemilihan Material', 'Eksekusi Proyek'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Hammer className="w-12 h-12" />,
    title: 'Desain Eksterior',
    description: 'Desain eksterior bangunan yang menarik dan sesuai dengan karakteristik lingkungan.',
    features: ['Facade Design', 'Taman Depan', 'Carport', 'Pagar'],
    color: 'from-green-500 to-green-600',
  },
  {
    icon: <Trees className="w-12 h-12" />,
    title: 'Landscaping',
    description: 'Penataan taman dan landscape yang indah dan fungsional untuk hunian atau komersial.',
    features: ['Taman Minimalis', 'Vertical Garden', 'Water Feature', 'Outdoor Lighting'],
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: <Store className="w-12 h-12" />,
    title: 'Renovasi Komersial',
    description: 'Renovasi untuk bangunan komersial seperti toko, restoran, dan kantor.',
    features: ['Interior Toko', 'Restaurant Design', 'Office Renovation', 'Co-working Space'],
    color: 'from-red-500 to-red-600',
  },
]

export default function LayananPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm mb-6">
            <Hammer className="w-5 h-5" />
            <span>Solusi Konstruksi</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Layanan Kami
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            Berbagai layanan profesional untuk memenuhi kebutuhan renovasi dan konstruksi Anda
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden group h-full"
              >
                <CardContent className="p-8 h-full flex flex-col">
                  {/* Icon with Gradient Background */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {service.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 leading-tight">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  
                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`} />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <Link href="https://wa.me/6283170619950?text=Halo%20Renovi,%20saya%20ingin%20konsultasi%20tentang%20proyek%20renovasi" className="mt-auto">
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group/btn"
                    >
                      Konsultasi Gratis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20">
            <div className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white rounded-3xl p-12 md:p-16 text-center shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Mewujudkan Proyek Impian Anda?
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Hubungi kami untuk konsultasi gratis dan dapatkan penawaran terbaik untuk proyek renovasi Anda
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
        </div>
      </section>
    </div>
  )
}