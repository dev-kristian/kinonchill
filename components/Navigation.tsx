//components/Navigation.tsx

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';

// Icon components
const MenuIcons = {
  Home: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sessions: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Explore: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  SignOut: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  SignIn: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  ChevronDown: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
};

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.nav-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-accent/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative nav-container">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsOpen(false)}
          >
            <Image 
              src="/icons/popcorn.png" 
              alt="Popcorn icon" 
              width={36}
              height={36}
              className="transition-transform group-hover:scale-110"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Kino & Chill
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-foreground/90 hover:text-accent transition-colors duration-200 font-medium"
            >
              {MenuIcons.Home}
              <span>Home</span>
            </Link>
            <Link 
              href="/sessions" 
              className="flex items-center space-x-2 text-foreground/90 hover:text-accent transition-colors duration-200 font-medium"
            >
              {MenuIcons.Sessions}
              <span>Sessions</span>
            </Link>
            <Link 
              href="/explore" 
              className="flex items-center space-x-2 text-foreground/90 hover:text-accent transition-colors duration-200 font-medium"
            >
              {MenuIcons.Explore}
              <span>Explore</span>
            </Link>
            
            {user ? (
              <div className="relative ml-4">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="User avatar"
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-accent">👤</span>
                    )}
                  </div>
                  {MenuIcons.ChevronDown}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-accent/10 rounded-lg shadow-lg py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-foreground/90 hover:bg-accent/5 transition-colors"
                    >
                      {MenuIcons.SignOut}
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="ml-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors duration-200 flex items-center space-x-2"
              >
                {MenuIcons.SignIn}
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-background/95 backdrop-blur-sm border-b border-accent/10 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link 
              href="/" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {MenuIcons.Home}
              <span>Home</span>
            </Link>
            <Link 
              href="/sessions" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {MenuIcons.Sessions}
              <span>Sessions</span>
            </Link>
            <Link 
              href="/explore" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {MenuIcons.Explore}
              <span>Explore</span>
            </Link>
            <div className="border-t border-accent/10 pt-2 mt-2">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-accent/5 transition-colors"
                >
                  {MenuIcons.SignOut}
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {MenuIcons.SignIn}
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}