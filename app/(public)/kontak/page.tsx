// FILE: app/(public)/kontak/page.tsx
// ========================================
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

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
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">Hubungi Kami</h1>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            Ada pertanyaan atau ingin memulai proyek? Jangan ragu untuk menghubungi kami
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama Anda"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                  <Input
                    label="Nomor Telepon"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                  <Textarea
                    label="Pesan"
                    placeholder="Ceritakan tentang proyek Anda..."
                    rows={5}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-light-primary/10 dark:bg-dark-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Alamat</h3>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Jl. Sudirman No. 123<br />
                        Pekanbaru, Riau 28282<br />
                        Indonesia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-light-primary/10 dark:bg-dark-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telepon</h3>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        +62 812-3456-7890<br />
                        +62 811-2233-4455
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-light-primary/10 dark:bg-dark-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        info@renovi.com<br />
                        support@renovi.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-light-primary/10 dark:bg-dark-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Jam Operasional</h3>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">
                        Senin - Jumat: 08:00 - 17:00<br />
                        Sabtu: 08:00 - 13:00<br />
                        Minggu: Tutup
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
