// app/(root)/page.tsx
import PopularItems from '@/components/PopularItems';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start p-24">
      <h2 className="text-2xl font-bold mb-4">Popular on Everyone&apos;s Watchlist</h2>
      <PopularItems />
    </main>
  )
}