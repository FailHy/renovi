// FILE: app/(public)/layanan/page.tsx
// ========================================
import { Building2, Hammer, PaintBucket, Trees, Store, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const services = [
  {
    icon: <Home className="w-12 h-12" />,
    title: 'Renovasi Rumah',
    description: 'Layanan renovasi rumah lengkap mulai dari dapur, kamar mandi, hingga perombakan total dengan monitoring real-time.',
    features: ['Renovasi Dapur', 'Renovasi Kamar Mandi', 'Renovasi Kamar Tidur', 'Renovasi Total'],
  },
  {
    icon: <Building2 className="w-12 h-12" />,
    title: 'Konstruksi Bangunan',
    description: 'Pembangunan gedung dari nol dengan sistem pelacakan progres yang transparan dan terstruktur.',
    features: ['Rumah Tinggal', 'Ruko', 'Gedung Kantor', 'Gudang'],
  },
  {
    icon: <PaintBucket className="w-12 h-12" />,
    title: 'Desain Interior',
    description: 'Jasa desain interior modern dan fungsional sesuai dengan kebutuhan dan budget Anda.',
    features: ['Konsultasi Desain', '3D Visualisasi', 'Pemilihan Material', 'Eksekusi Proyek'],
  },
  {
    icon: <Hammer className="w-12 h-12" />,
    title: 'Desain Eksterior',
    description: 'Desain eksterior bangunan yang menarik dan sesuai dengan karakteristik lingkungan.',
    features: ['Facade Design', 'Taman Depan', 'Carport', 'Pagar'],
  },
  {
    icon: <Trees className="w-12 h-12" />,
    title: 'Landscaping',
    description: 'Penataan taman dan landscape yang indah dan fungsional untuk hunian atau komersial.',
    features: ['Taman Minimalis', 'Vertical Garden', 'Water Feature', 'Outdoor Lighting'],
  },
  {
    icon: <Store className="w-12 h-12" />,
    title: 'Renovasi Komersial',
    description: 'Renovasi untuk bangunan komersial seperti toko, restoran, dan kantor.',
    features: ['Interior Toko', 'Restaurant Design', 'Office Renovation', 'Co-working Space'],
  },
]

export default function LayananPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">Layanan Kami</h1>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            Berbagai layanan profesional untuk memenuhi kebutuhan renovasi dan konstruksi Anda
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} hover className="h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-light-primary/10 dark:bg-dark-primary/10 rounded-2xl flex items-center justify-center mb-4 text-light-primary dark:text-dark-primary">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary text-white rounded-2xl p-12">
              <h2 className="text-3xl font-bold mb-4">Tertarik dengan Layanan Kami?</h2>
              <p className="text-xl mb-6 text-white/90">
                Hubungi kami untuk konsultasi gratis dan dapatkan penawaran terbaik
              </p>
              <Link href="/kontak">
                <Button variant="primary" className="bg-white text-light-primary hover:bg-white/90">
                  Hubungi Kami
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}