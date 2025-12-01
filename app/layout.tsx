import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // <-- Import CSS Global di sini saja (path relative)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Renovi - Platform Pelacakan Renovasi & Konstruksi',
  description: 'Platform pelacakan progres renovasi dan konstruksi',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="id">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}