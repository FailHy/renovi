// FILE: middleware.ts (ROOT)
// ========================================
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

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
    }

    // Proteksi route admin
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Proteksi route mandor
    if (path.startsWith('/mandor') && token?.role !== 'mandor') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Proteksi route klien
    if (path.startsWith('/klien') && token?.role !== 'pelanggan') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Allow public routes
        if (
          path === '/' ||
          path.startsWith('/layanan') ||
          path.startsWith('/portfolio') ||
          path.startsWith('/tentang') ||
          path.startsWith('/kontak') ||
          path.startsWith('/artikel') ||
          path === '/login'
        ) {
          return true
        }

        // Require authentication for dashboard routes
        return !!token
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