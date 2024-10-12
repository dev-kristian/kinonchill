// app/(auth)/signin/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/'); // Redirect to home page after successful sign-in
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error('Error signing in with Google:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null; 
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-8 text-accent">Sign In to Movie Hub</h1>
      <button
        onClick={handleGoogleSignIn}
        className="bg-primary hover:bg-primary-hover text-foreground font-bold py-2 px-4 rounded transition duration-300"
      >
        Sign in with Google
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}