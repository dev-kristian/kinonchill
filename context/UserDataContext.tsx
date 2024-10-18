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
  notification?: 'allowed' | 'denied' | 'unsupported';
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
  updateNotificationStatus: (status: 'allowed' | 'denied' | 'unsupported') => Promise<void>;
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
          notification: userInfo.notification,
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
      await setDoc(userDocRef, { email: user.email }, { merge: true });

      await setDoc(watchlistDocRef, {
        watchlist: {
          ...userData.watchlist,
          [mediaType]: {
            ...userData.watchlist[mediaType],
            [item.id.toString()]: true
          }
        }
      }, { merge: true });

      const itemsDoc = await getDoc(itemsDocRef);
      if (itemsDoc.exists()) {
        const itemsData = itemsDoc.data();
        if (itemsData[item.id]) {
          await updateDoc(itemsDocRef, {
            [`${item.id}.watchlist_count`]: increment(1),
            [`${item.id}.last_updated`]: serverTimestamp()
          });
        } else {
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

      await updateDoc(watchlistDocRef, {
        [`watchlist.${mediaType}.${id.toString()}`]: deleteField()
      });

      await updateDoc(itemsDocRef, {
        [`${id}.watchlist_count`]: increment(-1),
        [`${id}.last_updated`]: serverTimestamp()
      });

      console.log(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ID ${id} removed from watchlist successfully.`);
    } catch (error) {
      console.error(`Error removing ${mediaType} from watchlist:`, error);
    }
  };

  const updateNotificationStatus = async (status: 'allowed' | 'denied' | 'unsupported') => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          notification: status
        }, { merge: true });
        console.log(`Notification status updated to: ${status}`);
        
        // Update local state
        setUserData(prevData => prevData ? {...prevData, notification: status} : null);
      } catch (error) {
        console.error("Error updating notification status:", error);
        throw error;
      }
    } else {
      console.log("User not logged in. Cannot update notification status.");
      throw new Error("User not logged in");
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, isLoading, addToWatchlist, removeFromWatchlist, updateNotificationStatus }}>
      {children}
    </UserDataContext.Provider>
  );
};