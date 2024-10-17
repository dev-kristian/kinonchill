// app/(root)/layout.tsx
'use client'

import Navigation from '@/components/Navigation'
import { WithAuth } from '@/components/WithAuth'
import { UserDataProvider } from '@/context/UserDataContext'
import { SearchProvider } from '@/context/SearchContext'
import { TrendingProvider } from '@/context/TrendingContext'
import { PopularProvider } from '@/context/PopularContext'
import { PollProvider } from '@/context/PollContext'
import { ViewProvider } from '@/context/ViewContext'
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
        <PopularProvider>
          <TrendingProvider>
            <PollProvider>
          <div className="flex flex-col min-h-screen ">
            <Navigation />
            <main className="flex-grow ">
              {children}
              <Toaster />
            </main>
            </div>
            </PollProvider>
          </TrendingProvider>
        </PopularProvider>
      </SearchProvider>
    </UserDataProvider>
    </ViewProvider>
  )
}

export default WithAuth(RootLayout);