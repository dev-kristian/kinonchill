import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Media } from '@/types';

interface Watchlist {
  movie: Media[];
  tv: Media[];
}

interface UseWatchlistReturn {
  watchlistItems: Watchlist;
  addToWatchlist: (item: Media, mediaType: 'movie' | 'tv') => Promise<void>;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
}

export const useWatchlist = (): UseWatchlistReturn => {
  const { user } = useAuthContext();
  const [watchlistItems, setWatchlistItems] = useState<Watchlist>({ movie: [], tv: [] });

  // Reference to the user's watchlist document
  const watchlistDocRef = user ? doc(db, 'watchlists', user.uid) : null;

  // Fetch watchlist from Firestore
  useEffect(() => {
    if (!watchlistDocRef) return;

    const fetchWatchlist = async () => {
      try {
        const docSnap = await getDoc(watchlistDocRef);
        if (docSnap.exists()) {
          setWatchlistItems(docSnap.data() as Watchlist);
        } else {
          setWatchlistItems({ movie: [], tv: [] });
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, [user]);

  // Add item to watchlist
  const addToWatchlist = useCallback(
    async (item: Media, mediaType: 'movie' | 'tv') => {
      if (!watchlistDocRef) return;

      try {
        await setDoc(
          watchlistDocRef,
          {
            [mediaType]: arrayUnion(item),
          },
          { merge: true }
        );
        setWatchlistItems((prev) => ({
          ...prev,
          [mediaType]: [...prev[mediaType], item],
        }));
      } catch (error) {
        console.error(`Error adding ${mediaType} to watchlist:`, error);
      }
    },
    [watchlistDocRef]
  );

  // Remove item from watchlist
  const removeFromWatchlist = useCallback(
    async (id: number, mediaType: 'movie' | 'tv') => {
      if (!watchlistDocRef) return;

      try {
        const updatedItems = watchlistItems[mediaType].filter((item) => item.id !== id);
        await updateDoc(watchlistDocRef, {
          [mediaType]: updatedItems,
        });
        setWatchlistItems((prev) => ({
          ...prev,
          [mediaType]: updatedItems,
        }));
      } catch (error) {
        console.error(`Error removing ${mediaType} from watchlist:`, error);
      }
    },
    [watchlistDocRef, watchlistItems]
  );

  return { watchlistItems, addToWatchlist, removeFromWatchlist };
};
