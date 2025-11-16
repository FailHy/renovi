'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Building2, Menu, X, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Layanan', href: '/layanan' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Artikel', href: '/artikel' },
  { name: 'Tentang', href: '/tentang' },
  { name: 'Kontak', href: '/kontak' },
]

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
  <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Renovi
          </span>
          <p className="text-xs text-muted-foreground -mt-1">Construction Management</p>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              pathname === item.href
                ? 'text-primary bg-primary/10'
                : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-foreground"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </div>

    {/* Mobile Navigation */}
    {mobileMenuOpen && (
      <div className="md:hidden py-4 border-t border-gray-200">
        <div className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-4 py-3 rounded-lg font-medium transition-all duration-200',
                pathname === item.href
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    )}
  </nav>
</header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

{/* Footer */}
<footer className="bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 text-gray-700 border-t border-gray-200">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Company Info */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
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
          <a href="#" className="w-10 h-10 bg-white border border-gray-200 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
            <Facebook className="w-5 h-5 text-gray-600 hover:text-white" />
          </a>
          <a href="#" className="w-10 h-10 bg-white border border-gray-200 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
            <Instagram className="w-5 h-5 text-gray-600 hover:text-white" />
          </a>
          <a href="#" className="w-10 h-10 bg-white border border-gray-200 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
            <Twitter className="w-5 h-5 text-gray-600 hover:text-white" />
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
                className="text-gray-600 hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
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
          <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Renovasi Rumah</li>
          <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Konstruksi Bangunan</li>
          <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Desain Interior</li>
          <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Desain Eksterior</li>
          <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Landscaping</li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-gray-900 font-semibold text-lg mb-4">Kontak Kami</h3>
        <ul className="space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-gray-600">Jl. Sudirman No. 123, Pekanbaru, Riau 28282</span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-gray-600">+62 812-3456-7890</span>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-gray-600">info@renovi.com</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-gray-300 mt-12 pt-8 text-center">
      <p className="text-gray-600 text-sm">
      </p>
    </div>
  </div>
</footer>
    </div>
  )
}