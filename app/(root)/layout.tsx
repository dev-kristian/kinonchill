// app/(root)/layout.tsx
'use client'

import Navigation from '@/components/Navigation'
import { WithAuth } from '@/components/WithAuth'
import { UserDataProvider } from '@/context/UserDataContext'
import { SearchProvider } from '@/context/SearchContext'
import { TrendingProvider } from '@/context/TrendingContext'
import { PopularProvider } from '@/context/PopularContext'

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserDataProvider>
      <SearchProvider>
        <PopularProvider>
          <TrendingProvider>
          <div className="flex flex-col min-h-screen ">
            <Navigation />
            <main className="flex-grow ">
              {children}
            </main>
            </div>
          </TrendingProvider>
        </PopularProvider>
      </SearchProvider>
    </UserDataProvider>
  )
}

export default WithAuth(RootLayout);