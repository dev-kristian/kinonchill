// app/(root)/layout.tsx
'use client'

import Navigation from '@/components/Navigation'
import { WithAuth } from '@/components/WithAuth'
import { UserDataProvider } from '@/context/UserDataContext'
import { SearchProvider } from '@/context/SearchContext'
import { TrendingProvider } from '@/context/TrendingContext'
import { TopWatchlistProvider } from '@/context/TopWatchlistContext'
import { PollProvider } from '@/context/PollContext'
import { ViewProvider } from '@/context/ViewContext'
import { SessionProvider } from '@/context/SessionContext'
import { Toaster } from '@/components/ui/toaster'

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewProvider>
      <UserDataProvider>
        <SearchProvider>
          <TopWatchlistProvider>
            <TrendingProvider>
              <PollProvider>
                <SessionProvider>
                  <div className="flex flex-col min-h-screen ">
                    <Navigation />
                    <main className="flex-grow ">
                      {children}
                      <Toaster />
                    </main>
                  </div>
                </SessionProvider>
              </PollProvider>
            </TrendingProvider>
          </TopWatchlistProvider>
        </SearchProvider>
      </UserDataProvider>
    </ViewProvider>
  )
}

export default WithAuth(RootLayout);