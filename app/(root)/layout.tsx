// app/(root)/layout.tsx
'use client'

import Navigation from '@/components/Navigation'
import { WithAuth } from '@/components/WithAuth'
import { UserDataProvider } from '@/context/UserDataContext'
import { SearchProvider } from '@/context/SearchContext' // Import the new SearchProvider

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserDataProvider>
      <SearchProvider>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </SearchProvider>
    </UserDataProvider>
  )
}

export default WithAuth(RootLayout);