// context/UserDataContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface UserData {
  watchedMovies: { [movieId: string]: boolean };
  // Add more user data properties here in the future, e.g.:
  // favoriteMovies: { [movieId: string]: boolean };
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  addWatchedMovie: (movieId: number) => Promise<void>;
  removeWatchedMovie: (movieId: number) => Promise<void>;
  // Add more functions for future features, e.g.:
  // addFavoriteMovie: (movieId: number) => Promise<void>;
  // removeFavoriteMovie: (movieId: number) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data() as UserData);
      } else {
        setUserData({ watchedMovies: {} });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addWatchedMovie = async (movieId: number) => {
    if (!user || !userData) return;

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      ...userData,
      watchedMovies: { ...userData.watchedMovies, [movieId.toString()]: true }
    }, { merge: true });
  };

  const removeWatchedMovie = async (movieId: number) => {
    if (!user || !userData) return;

    const userDocRef = doc(db, 'users', user.uid);
    const updatedWatchedMovies = { ...userData.watchedMovies };
    delete updatedWatchedMovies[movieId.toString()];
    await setDoc(userDocRef, {
      ...userData,
      watchedMovies: updatedWatchedMovies
    }, { merge: true });
  };

  return (
    <UserDataContext.Provider value={{ userData, isLoading, addWatchedMovie, removeWatchedMovie }}>
      {children}
    </UserDataContext.Provider>
  );
};