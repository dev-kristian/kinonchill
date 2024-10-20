// app/(auth)/signin/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { FaGoogle, FaUser, FaLock } from 'react-icons/fa';

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
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-md space-y-6 bg-transparent p-4 md:p-8 rounded-lg shadow-2xl">
        <div>
          <h1 className="text-5xl font-bold mb-2 text-gradient">Kino & Chill</h1>
          <p className="text-xl text-foreground/80 mb-8">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleUsernameSignIn} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-transparent border border-gray-600 hover:bg-gray-900/20 text-white font-bold py-3 rounded-md transition duration-300 transform hover:scale-105 "
          >
            <span className="relative z-10 signin-text">Sign In / Sign Up</span>
            <div className="absolute inset-0 h-full w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 opacity-50"></div>
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-transparent border border-gray-600 hover:bg-gray-900/20 text-white font-bold py-3 rounded-md transition duration-300 transform hover:scale-105 "
        >
          <FaGoogle className="mr-2" />
          <span className="">Sign in with</span>
          <span className="google-text">&nbsp;Google</span>
        </button>
        
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}