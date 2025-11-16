// FILE: app/(public)/kontak/page.tsx
// ========================================
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

export default function KontakPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Pesan Anda telah terkirim! Kami akan menghubungi Anda segera.')
    setIsSubmitting(false)
    e.currentTarget.reset()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Hubungi Kami
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            Ada pertanyaan atau ingin memulai proyek? Tim profesional kami siap membantu mewujudkan impian Anda
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-3 text-gray-900">
                      Mulai Percakapan
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Isi form berikut dan kami akan menghubungi Anda dalam 24 jam
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Nama Lengkap"
                        placeholder="Masukkan nama Anda"
                        required
                        className="bg-white border-gray-200 focus:border-primary"
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="email@example.com"
                        required
                        className="bg-white border-gray-200 focus:border-primary"
                      />
                    </div>
                    
                    <Input
                      label="Nomor Telepon"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      required
                      className="bg-white border-gray-200 focus:border-primary"
                    />
                    
                    <Textarea
                      label="Pesan"
                      placeholder="Ceritakan tentang proyek impian Anda..."
                      rows={6}
                      required
                      className="bg-white border-gray-200 focus:border-primary resize-none"
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white py-3 h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Mengirim Pesan...'
                      ) : (
                        <>
                          Kirim Pesan
                          <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  Informasi Kontak
                </h2>
                <p className="text-gray-600 text-lg">
                  Beberapa cara untuk terhubung dengan tim Renovi
                </p>
              </div>

              <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Alamat Kantor</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Jl. Sudirman No. 123, CBD Business District<br />
                        Pekanbaru, Riau 28282<br />
                        Indonesia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Telepon & WhatsApp</h3>
                      <p className="text-gray-600 leading-relaxed">
                        <a href="tel:+6281234567890" className="hover:text-primary transition-colors">
                          +62 812-3456-7890
                        </a>
                        <br />
                        <a href="tel:+6281122334455" className="hover:text-primary transition-colors">
                          +62 811-2233-4455
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Email</h3>
                      <p className="text-gray-600 leading-relaxed">
                        <a href="mailto:info@renovi.com" className="hover:text-primary transition-colors block">
                          info@renovi.com
                        </a>
                        <a href="mailto:support@renovi.com" className="hover:text-primary transition-colors block">
                          support@renovi.com
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Jam Operasional</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Senin - Jumat: 08:00 - 17:00 WIB<br />
                        Sabtu: 08:00 - 13:00 WIB<br />
                        Minggu: Tutup
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-bold text-lg mb-3 text-gray-900">Response Time</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  • Email: Dalam 2 jam kerja<br />
                  • Telepon: Langsung diangkat<br />
                  • WhatsApp: Dalam 15 menit<br />
                  • Konsultasi gratis tersedia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}