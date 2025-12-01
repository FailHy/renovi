// FILE: src/components/Footer.tsx
// ========================================
'use client'

import Link from 'next/link'
import { Building2, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Layanan', href: '/layanan' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Artikel', href: '/artikel' },
  { name: 'Tentang', href: '/tentang' },
  { name: 'Kontak', href: 'https://wa.me/6283170619950?text=Halo%20Renovi,%20saya%20ingin%20konsultasi%20tentang%20proyek%20renovasi' },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 text-gray-700 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Renovi</span>
                <p className="text-sm text-gray-600">Construction Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Platform pelacakan progres renovasi dan konstruksi yang memudahkan monitoring proyek Anda secara real-time.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/people/Renovi-Indonesia/61577616446930/" 
              target="_blank"
              className="w-10 h-10 bg-white border border-gray-200 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/25 group">
                <Facebook className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </a>
              <a href="https://www.instagram.com/renovi.indonesia" 
              target="_blank"
               className="w-10 h-10 bg-white border border-gray-200 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/25 group">
                <Instagram className="w-5 h-5 text-gray-600 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-600 hover:text-blue-600 transition-all duration-200 hover:translate-x-1 inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Layanan Kami</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">Renovasi Rumah</li>
              <li className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">Konstruksi Bangunan</li>
              <li className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">Desain Interior</li>
              <li className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">Desain Eksterior</li>
              <li className="hover:text-blue-600 transition-colors duration-200 cursor-pointer">Landscaping</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Kontak Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">Jl. Sudirman No. 123, Pekanbaru, Riau 28282</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">info@renovi.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-12 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Renovi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}