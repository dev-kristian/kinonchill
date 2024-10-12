//app/(root)/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-accent">Movie Hub</h1>
      <p className="text-xl mb-4">Welcome to our movie tracking website!</p>
      <div className="flex space-x-4">
        <a href="/movies" className="bg-primary hover:bg-primary-hover text-foreground font-bold py-2 px-4 rounded transition duration-300">
          Browse Movies
        </a>
        <a href="/profile" className="bg-secondary hover:bg-secondary-hover text-foreground font-bold py-2 px-4 rounded transition duration-300">
          My Profile
        </a>
      </div>
    </main>
  )
}