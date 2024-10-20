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
import { Media, UserData, TopWatchlistItem } from '@/types/types';
import { useTopWatchlist } from './TopWatchlistContext';

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  addToWatchlist: (item: Media, mediaType: 'movie' | 'tv') => Promise<void>;
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
  const { topWatchlistItems, setTopWatchlistItems } = useTopWatchlist();

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
  
  const addToWatchlist = async (item: Media, mediaType: 'movie' | 'tv') => {
    if (!user || !userData) return;

    const userDocRef = doc(db, 'users', user.uid);
    const watchlistDocRef = doc(db, 'users', user.uid, 'userMovieData', 'watchlist');
    const itemsDocRef = doc(db, mediaType === 'movie' ? 'movies' : 'tvShows', 'allItems');

    try {
      await setDoc(userDocRef, { email: user.email }, { merge: true });

      // Update local state
      setUserData(prevData => ({
        ...prevData!,
        watchlist: {
          ...prevData!.watchlist,
          [mediaType]: {
            ...prevData!.watchlist[mediaType],
            [item.id.toString()]: true
          }
        }
      }));

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

          // Update TopWatchlist state
          setTopWatchlistItems(prevItems => {
            const updatedItems = [...prevItems[mediaType]];
            const index = updatedItems.findIndex(i => i.id === item.id);
            if (index !== -1) {
              updatedItems[index] = {
                ...updatedItems[index],
                watchlist_count: ((updatedItems[index].watchlist_count || 0) + 1),
                weighted_score: ((updatedItems[index].vote_average || 0) * 1.3) + ((updatedItems[index].watchlist_count || 0) + 1)
              };
              updatedItems.sort((a, b) => b.weighted_score - a.weighted_score);
            } else if (updatedItems.length < 20) {
              updatedItems.push({
                ...item,
                watchlist_count: 1,
                weighted_score: ((item.vote_average || 0) * 1.3) + 1
              } as TopWatchlistItem);
              updatedItems.sort((a, b) => b.weighted_score - a.weighted_score);
            }
            return {
              ...prevItems,
              [mediaType]: updatedItems.slice(0, 20)
            };
          });
        } else {
          const newItem = {
            ...item,
            media_type: mediaType,
            last_updated: serverTimestamp(),
            watchlist_count: 1
          };
          await updateDoc(itemsDocRef, {
            [item.id]: newItem
          });

          // Update TopWatchlist state
          setTopWatchlistItems(prevItems => {
            const updatedItems = [...prevItems[mediaType], {
              ...newItem,
              weighted_score: ((item.vote_average || 0) * 1.3) + 1
            } as TopWatchlistItem];
            updatedItems.sort((a, b) => b.weighted_score - a.weighted_score);
            return {
              ...prevItems,
              [mediaType]: updatedItems.slice(0, 20)
            };
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

      // Update local state
      setUserData(prevData => {
        const updatedWatchlist = { ...prevData!.watchlist };
        delete updatedWatchlist[mediaType][id.toString()];
        return { ...prevData!, watchlist: updatedWatchlist };
      });

      await updateDoc(watchlistDocRef, {
        [`watchlist.${mediaType}.${id.toString()}`]: deleteField()
      });

      await updateDoc(itemsDocRef, {
        [`${id}.watchlist_count`]: increment(-1),
        [`${id}.last_updated`]: serverTimestamp()
      });

      // Update TopWatchlist state
      setTopWatchlistItems(prevItems => {
        const updatedItems = prevItems[mediaType].map(item => {
          if (item.id === id) {
            const newWatchlistCount = Math.max((item.watchlist_count || 1) - 1, 0);
            return {
              ...item,
              watchlist_count: newWatchlistCount,
              weighted_score: ((item.vote_average || 0) * 1.3) + newWatchlistCount
            };
          }
          return item;
        }).filter(item => (item.watchlist_count || 0) > 0);
        updatedItems.sort((a, b) => b.weighted_score - a.weighted_score);
        return {
          ...prevItems,
          [mediaType]: updatedItems
        };
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