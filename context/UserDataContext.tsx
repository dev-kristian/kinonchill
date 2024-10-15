// context/UserDataContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  deleteField, 
  getDoc, 
  serverTimestamp, 
  Timestamp,
  increment
} from 'firebase/firestore';

interface UserData {
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

    const watchlistDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchlist');
    const unsubscribe = onSnapshot(watchlistDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data() as UserData);
      } else {
        setUserData({ watchlist: { movie: {}, tv: {} } });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addToWatchlist = async (item: MovieTVDetails, mediaType: 'movie' | 'tv') => {
    if (!user || !userData) return;
  
    const userDocRef = doc(db, 'users', user.uid);
    const watchlistDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchlist');
    const itemCollectionRef = collection(db, mediaType === 'movie' ? 'movies' : 'tvShows');
    const itemDocRef = doc(itemCollectionRef, item.id.toString());
  
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

      // Check if the item already exists in the collection
      const itemDoc = await getDoc(itemDocRef);
      const now = Timestamp.now();
      
      if (!itemDoc.exists()) {
        // If it doesn't exist, add it to the collection with initial watchlist_count of 1
        await setDoc(itemDocRef, {
          ...item,
          last_updated: serverTimestamp(),
          watchlist_count: 1
        });
      } else {
        // If it exists, increment the watchlist_count and update if necessary
        const data = itemDoc.data();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        if (data.last_updated.toDate() < oneWeekAgo) {
          // If the data is older than a week, update it
          await updateDoc(itemDocRef, {
            ...item,
            last_updated: serverTimestamp(),
            watchlist_count: increment(1)
          });
        } else {
          // If the data is recent, just increment the watchlist_count
          await updateDoc(itemDocRef, {
            watchlist_count: increment(1)
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
      const itemCollectionRef = collection(db, mediaType === 'movie' ? 'movies' : 'tvShows');
      const itemDocRef = doc(itemCollectionRef, id.toString());
  
      // Remove from user's watchlist
      await updateDoc(watchlistDocRef, {
        [`watchlist.${mediaType}.${id.toString()}`]: deleteField()
      });
  
      // Decrement the watchlist_count in the central collection
      await updateDoc(itemDocRef, {
        watchlist_count: increment(-1)
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