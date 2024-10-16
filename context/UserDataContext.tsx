// context/UserDataContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  deleteField, 
  getDoc, 
  serverTimestamp, 
  increment
} from 'firebase/firestore';

interface UserData {
  username: string;
  watchlist: {
    movie: { [movieId: string]: boolean };
    tv: { [tvId: string]: boolean };
  };
}

interface MovieTVDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  addToWatchlist: (item: MovieTVDetails, mediaType: 'movie' | 'tv') => Promise<void>;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
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
    const watchlistDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchlist');

    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userInfo = docSnapshot.data();
        const watchlistSnapshot = await getDoc(watchlistDocRef);
        const watchlistData = watchlistSnapshot.exists() ? watchlistSnapshot.data() : { watchlist: { movie: {}, tv: {} } };

        setUserData({
          username: userInfo.username,
          ...watchlistData
        } as UserData);
      } else {
        setUserData({ username: '', watchlist: { movie: {}, tv: {} } });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addToWatchlist = async (item: MovieTVDetails, mediaType: 'movie' | 'tv') => {
    if (!user || !userData) return;

    const userDocRef = doc(db, 'users', user.uid);
    const watchlistDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchlist');
    const itemsDocRef = doc(db, mediaType === 'movie' ? 'movies' : 'tvShows', 'allItems');

    try {
      // Ensure user document exists in the root users collection
      await setDoc(userDocRef, { email: user.email }, { merge: true });

      // Add to user's watchlist
      await setDoc(watchlistDocRef, {
        watchlist: {
          ...userData.watchlist,
          [mediaType]: {
            ...userData.watchlist[mediaType],
            [item.id.toString()]: true
          }
        }
      }, { merge: true });

      // Update the item in the allItems document
      const itemsDoc = await getDoc(itemsDocRef);
      if (itemsDoc.exists()) {
        const itemsData = itemsDoc.data();
        if (itemsData[item.id]) {
          // If the item exists, increment the watchlist_count
          await updateDoc(itemsDocRef, {
            [`${item.id}.watchlist_count`]: increment(1),
            [`${item.id}.last_updated`]: serverTimestamp()
          });
        } else {
          // If the item doesn't exist, add it with initial watchlist_count of 1
          await updateDoc(itemsDocRef, {
            [item.id]: {
              ...item,
              media_type: mediaType,
              last_updated: serverTimestamp(),
              watchlist_count: 1
            }
          });
        }
      }

      console.log(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ID ${item.id} added to watchlist and central collection successfully.`);
    } catch (error) {
      console.error(`Error adding ${mediaType} to watchlist and central collection:`, error);
    }
  };

  const removeFromWatchlist = async (id: number, mediaType: 'movie' | 'tv') => {
    if (!user || !userData) return;

    try {
      const watchlistDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchlist');
      const itemsDocRef = doc(db, mediaType === 'movie' ? 'movies' : 'tvShows', 'allItems');

      // Remove from user's watchlist
      await updateDoc(watchlistDocRef, {
        [`watchlist.${mediaType}.${id.toString()}`]: deleteField()
      });

      // Decrement the watchlist_count in the allItems document
      await updateDoc(itemsDocRef, {
        [`${id}.watchlist_count`]: increment(-1),
        [`${id}.last_updated`]: serverTimestamp()
      });

      console.log(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ID ${id} removed from watchlist successfully.`);
    } catch (error) {
      console.error(`Error removing ${mediaType} from watchlist:`, error);
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, isLoading, addToWatchlist, removeFromWatchlist }}>
      {children}
    </UserDataContext.Provider>
  );
};