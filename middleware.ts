import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Jika tidak ada token di protected routes, redirect ke login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect ke dashboard sesuai role jika akses root dashboard
    if (path === '/dashboard') {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      if (token?.role === 'mandor') {
        return NextResponse.redirect(new URL('/mandor', req.url))
      }
      if (token?.role === 'pelanggan') {
        return NextResponse.redirect(new URL('/klien', req.url))
      }
      // Fallback jika role tidak dikenali
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Proteksi route admin - hanya admin yang bisa akses
    if (path.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        // Redirect ke dashboard sesuai role user, bukan ke login
        if (token?.role === 'mandor') {
          return NextResponse.redirect(new URL('/mandor', req.url))
        }
        if (token?.role === 'pelanggan') {
          return NextResponse.redirect(new URL('/klien', req.url))
        }
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Proteksi route mandor - hanya mandor yang bisa akses
    if (path.startsWith('/mandor')) {
      if (token?.role !== 'mandor') {
        // Redirect ke dashboard sesuai role user
        if (token?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        if (token?.role === 'pelanggan') {
          return NextResponse.redirect(new URL('/klien', req.url))
        }
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Proteksi route klien - hanya pelanggan yang bisa akses
    if (path.startsWith('/klien')) {
      if (token?.role !== 'pelanggan') {
        // Redirect ke dashboard sesuai role user
        if (token?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        if (token?.role === 'mandor') {
          return NextResponse.redirect(new URL('/mandor', req.url))
        }
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Allow public routes tanpa authentication
        if (
          path === '/' ||
          path.startsWith('/layanan') ||
          path.startsWith('/portfolio') ||
          path.startsWith('/tentang') ||
          // path.startsWith('https://wa.me/6283170619950?text=Halo%20Renovi,%20saya%20ingin%20konsultasi%20tentang%20proyek%20renovasi') ||
          path.startsWith('/artikel') ||
          path === '/login' ||
          path === '/register' ||
          path.startsWith('/_next') ||
          path.startsWith('/api/auth')
        ) {
          return true
        }

        // Require authentication untuk semua dashboard routes
        if (
          path.startsWith('/admin') ||
          path.startsWith('/mandor') ||
          path.startsWith('/klien') ||
          path === '/dashboard'
        ) {
          return !!token
        }

        // Default: allow
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/mandor/:path*',
    '/klien/:path*',
    '/dashboard',
  ],
}