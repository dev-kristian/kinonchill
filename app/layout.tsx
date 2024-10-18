import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kino & Chill',
  description: 'Track and share movies with friends',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/popcorn.svg',
    apple: '/icons/popcorn.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground `}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}