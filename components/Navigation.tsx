//components/Navigation.tsx

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className=" p-2">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-foreground text-xl font-bold flex items-center">
          <Image 
            src="/icons/popcorn.png" 
            alt="Popcorn icon" 
            width={28}
            height={28} 
            className="mb-2"
          />
          Kino & Chill
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Close' : 'Menu'}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-foreground hover:text-accent">
            Home
          </Link>
          <Link href="/explore" className="text-foreground hover:text-accent">
            Explore
          </Link>
          {user ? (
            <button onClick={handleSignOut} className="text-foreground hover:text-accent">
              Sign Out
            </button>
          ) : (
            <Link href="/signin" className="text-foreground hover:text-accent">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-2">
          <Link href="/" className="block text-foreground hover:text-accent py-2">
            Home
          </Link>
          <Link href="/explore" className="block text-foreground hover:text-accent py-2">
            Explore
          </Link>
          {user ? (
            <button onClick={handleSignOut} className="block text-foreground hover:text-accent py-2">
              Sign Out
            </button>
          ) : (
            <Link href="/signin" className="block text-foreground hover:text-accent py-2">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}