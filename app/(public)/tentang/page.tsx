// FILE: app/(public)/tentang/page.tsx
// ========================================
import { Card, CardContent } from '@/components/ui/Card'
import { Target, Eye, Award, Users } from 'lucide-react'

export default function TentangPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">Tentang Renovi</h1>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            Platform pelacakan progres renovasi dan konstruksi terpercaya di Indonesia
          </p>
        </div>
      </section>

      {/* Company Info */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Siapa Kami</h2>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Renovi adalah platform inovatif yang menghubungkan pemilik proyek dengan kontraktor profesional. 
              Kami menyediakan sistem monitoring real-time yang transparan, memungkinkan klien untuk memantau 
              setiap detail progres renovasi atau konstruksi mereka kapan saja, di mana saja.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-light-primary/10 dark:bg-dark-primary/10 rounded-2xl flex items-center justify-center mb-4 text-light-primary dark:text-dark-primary">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Visi Kami</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Menjadi platform #1 di Indonesia untuk pelacakan dan manajemen proyek renovasi dan konstruksi 
                  yang transparan, efisien, dan terpercaya.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-light-primary/10 dark:bg-dark-primary/10 rounded-2xl flex items-center justify-center mb-4 text-light-primary dark:text-dark-primary">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Misi Kami</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Memberikan solusi teknologi yang memudahkan monitoring proyek konstruksi, meningkatkan 
                  transparansi, dan membangun kepercayaan antara klien dan kontraktor.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="text-center p-6">
                <Award className="w-12 h-12 mx-auto mb-4 text-light-primary dark:text-dark-primary" />
                <h4 className="font-semibold text-lg mb-2">Profesional</h4>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Tim berpengalaman dan terlatih
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6">
                <Eye className="w-12 h-12 mx-auto mb-4 text-light-primary dark:text-dark-primary" />
                <h4 className="font-semibold text-lg mb-2">Transparan</h4>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Monitoring real-time setiap progres
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6">
                <Users className="w-12 h-12 mx-auto mb-4 text-light-primary dark:text-dark-primary" />
                <h4 className="font-semibold text-lg mb-2">Terpercaya</h4>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Dipercaya ratusan klien
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}