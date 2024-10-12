// app/(root)/layout.tsx
'use client'

import Navigation from '@/components/Navigation'
import { WithAuth } from '@/components/WithAuth'
import { UserDataProvider } from '@/context/UserDataContext'
import { SearchProvider } from '@/context/SearchContext'
import { TrendingProvider } from '@/context/TrendingContext'

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserDataProvider>
      <SearchProvider>
        <TrendingProvider>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </TrendingProvider>
      </SearchProvider>
    </UserDataProvider>
  )
}

export default WithAuth(RootLayout);