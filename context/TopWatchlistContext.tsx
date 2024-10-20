// context/TopWatchlistContext.tsx
'use client'

import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc ,DocumentData} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TopWatchlistItem } from '@/types/types';


interface TopWatchlistContextType {
  topWatchlistItems: {
    movie: TopWatchlistItem[];
    tv: TopWatchlistItem[];
  };
  isLoading: boolean;
  error: string | null;
  fetchTopWatchlistItems: (mediaType: 'movie' | 'tv') => Promise<void>;
  getWatchlistCount: (id: number, mediaType: 'movie' | 'tv') => Promise<number>;
}

const TopWatchlistContext = createContext<TopWatchlistContextType | undefined>(undefined);

export const useTopWatchlist = () => {
  const context = useContext(TopWatchlistContext);
  if (!context) {
    throw new Error('useTopWatchlist must be used within a TopWatchlistProvider');
  }
  return context;
};

export const TopWatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topWatchlistItems, setTopWatchlistItems] = useState<{ movie: TopWatchlistItem[]; tv: TopWatchlistItem[] }>({
    movie: [],
    tv: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState({ movie: false, tv: false });
  const topWatchlistItemsRef = useRef(topWatchlistItems);

  useEffect(() => {
    topWatchlistItemsRef.current = topWatchlistItems;
  }, [topWatchlistItems]);

  const fetchTopWatchlistItems = useCallback(async (mediaType: 'movie' | 'tv') => {
    if (topWatchlistItemsRef.current[mediaType].length > 0 || isFetching[mediaType]) return;
  
    setIsFetching(prev => ({ ...prev, [mediaType]: true }));
    try {
      setIsLoading(true);
      setError(null);
      
      const docRef = doc(db, mediaType === 'movie' ? 'movies' : 'tvShows', 'allItems');
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = Object.values(data)
          .filter((item: DocumentData) => 
            item.media_type === mediaType && 
            item.vote_average > 0 && 
            item.watchlist_count > 0
          )
          .map((item: DocumentData) => ({
            ...item,
            weighted_score: (item.vote_average * 1.3) + item.watchlist_count
          }));
  
        // Sort items by weighted score
        items.sort((a, b) => b.weighted_score - a.weighted_score);
  
        // Limit to 20 items
        const limitedItems = items.slice(0, 20) as TopWatchlistItem[];
  
        setTopWatchlistItems(prev => ({ ...prev, [mediaType]: limitedItems }));
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error('Error fetching topWatchlist items:', error);
      setError('Failed to fetch topWatchlist items');
    } finally {
      setIsLoading(false);
      setIsFetching(prev => ({ ...prev, [mediaType]: false }));
    }
  }, [isFetching]);
  useEffect(() => {
    if (topWatchlistItems.movie.length === 0) {
      fetchTopWatchlistItems('movie');
    }
    if (topWatchlistItems.tv.length === 0) {
      fetchTopWatchlistItems('tv');
    }
  }, [fetchTopWatchlistItems, topWatchlistItems.movie.length, topWatchlistItems.tv.length]);

  const getWatchlistCount = useCallback(async (id: number, mediaType: 'movie' | 'tv') => {
    try {
      const docRef = doc(db, mediaType === 'movie' ? 'movies' : 'tvShows', id.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().watchlist_count || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching watchlist count:', error);
      return 0;
    }
  }, []);

  return (
    <TopWatchlistContext.Provider value={{ 
      topWatchlistItems, 
      isLoading, 
      error, 
      fetchTopWatchlistItems,
      getWatchlistCount
    }}>
      {children}
    </TopWatchlistContext.Provider>
  );
};