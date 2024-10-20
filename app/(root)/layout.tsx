// app/(root)/layout.tsx
'use client'

import Navigation from '@/components/Navigation'
import { WithAuth } from '@/components/WithAuth'
import { UserDataProvider } from '@/context/UserDataContext'
import { SearchProvider } from '@/context/SearchContext'
import { TrendingProvider } from '@/context/TrendingContext'
import { TopWatchlistProvider } from '@/context/TopWatchlistContext'
import { SessionProvider } from '@/context/SessionContext'
import { Toaster } from '@/components/ui/toaster'

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
          <TopWatchlistProvider>
      <UserDataProvider>
        <SearchProvider>
            <TrendingProvider>
                <SessionProvider>
                  <div className="flex flex-col min-h-screen ">
                    <Navigation />
                    <main className="flex-grow ">
                      {children}
                      <Toaster />
                    </main>
                  </div>
                </SessionProvider>
            </TrendingProvider>
        </SearchProvider>
      </UserDataProvider>
          </TopWatchlistProvider>
  )
}

export default WithAuth(RootLayout);