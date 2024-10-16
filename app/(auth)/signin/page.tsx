// app/(auth)/signin/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && user) {
      router.push('/explore');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
  
      if (!userDoc.exists()) {
        // If the user doesn't exist in Firestore, add them
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName || `user${user.uid.substring(0, 8)}`, // Fallback if no display name
          email: user.email
        });
      }
  
      router.push('/');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Error signing in with Google:', error);
    }
  };

  const handleUsernameSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
  
    const email = `${username}@gmail.com`;
  
    try {
      // Try to create a new account first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add user to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username: username,
        email: email
      });
  
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          // If the email is already in use, try to sign in
          try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
          } catch (signInError: unknown) {
            if (signInError instanceof FirebaseError) {
              if (signInError.code === 'auth/wrong-password') {
                setError('Invalid username or password. Please try again.');
              } else {
                setError('Failed to sign in. Please try again.');
                console.error('Error signing in:', signInError);
              }
            }
          }
        } else {
          setError('Failed to create account. Please try again.');
          console.error('Error creating account:', error);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', error);
      }
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
      
      <form onSubmit={handleUsernameSignIn} className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border-none border-transparent bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border-none border-transparent bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-foreground font-bold py-2 px-4 rounded transition duration-300"
        >
          Sign In / Sign Up
        </button>
      </form>

      <div className="relative">
        <hr className="my-8" />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-gray-500">
          OR
        </span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Sign in with Google
      </button>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}