// FILE: app/layout.tsx (ROOT LAYOUT)
// ========================================
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Renovi - Platform Pelacakan Renovasi & Konstruksi',
  description: 'Platform pelacakan progres renovasi dan konstruksi yang transparan dan mudah digunakan',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    // Tambahkan class="dark" di sini untuk mengaktifkan mode gelap
    <html lang="id" suppressHydrationWarning className="dark"> 
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}