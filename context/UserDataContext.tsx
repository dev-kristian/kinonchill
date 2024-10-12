// context/UserDataContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';

interface UserData {
  watchedMovies: { [movieId: string]: boolean };
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  addWatchedMovie: (movieId: number) => Promise<void>;
  removeWatchedMovie: (movieId: number) => Promise<void>;
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

    const watchedMoviesDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchedMovies');
    const unsubscribe = onSnapshot(watchedMoviesDocRef, (docSnapshot) => {
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

    const watchedMoviesDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchedMovies');
    await setDoc(watchedMoviesDocRef, {
      watchedMovies: { ...userData.watchedMovies, [movieId.toString()]: true }
    }, { merge: true });
  };

  const removeWatchedMovie = async (movieId: number) => {
    if (!user || !userData) return;
  
    try {
      const watchedMoviesDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchedMovies');
  
      // Use updateDoc to remove the specific movieId from the watchedMovies map
      await updateDoc(watchedMoviesDocRef, {
        [`watchedMovies.${movieId.toString()}`]: deleteField()
      });
  
      console.log(`Movie ID ${movieId} removed successfully.`);
    } catch (error) {
      console.error('Error removing movie from watchedMovies:', error);
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, isLoading, addWatchedMovie, removeWatchedMovie }}>
      {children}
    </UserDataContext.Provider>
  );
};