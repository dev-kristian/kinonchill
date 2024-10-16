// context/PopularContext.tsx
'use client'

import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { collection, query, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PopularItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  watchlist_count: number;
  weighted_score: number;
}

interface PopularContextType {
  popularItems: {
    movie: PopularItem[];
    tv: PopularItem[];
  };
  isLoading: boolean;
  error: string | null;
  fetchPopularItems: (mediaType: 'movie' | 'tv') => Promise<void>;
  getWatchlistCount: (id: number, mediaType: 'movie' | 'tv') => Promise<number>;
}

const PopularContext = createContext<PopularContextType | undefined>(undefined);

export const usePopular = () => {
  const context = useContext(PopularContext);
  if (!context) {
    throw new Error('usePopular must be used within a PopularProvider');
  }
  return context;
};

export const PopularProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popularItems, setPopularItems] = useState<{ movie: PopularItem[]; tv: PopularItem[] }>({
    movie: [],
    tv: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState({ movie: false, tv: false });
  const popularItemsRef = useRef(popularItems);

  useEffect(() => {
    popularItemsRef.current = popularItems;
  }, [popularItems]);

  const fetchPopularItems = useCallback(async (mediaType: 'movie' | 'tv') => {
    if (popularItemsRef.current[mediaType].length > 0 || isFetching[mediaType]) return;
  
    setIsFetching(prev => ({ ...prev, [mediaType]: true }));
    try {
      setIsLoading(true);
      setError(null);
      
      const docRef = doc(db, mediaType === 'movie' ? 'movies' : 'tvShows', 'allItems');
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = Object.values(data)
          .filter((item: any) => 
            item.media_type === mediaType && 
            item.vote_average > 0 && 
            item.watchlist_count > 0
          )
          .map((item: any) => ({
            ...item,
            weighted_score: (item.vote_average * 1.3) + item.watchlist_count
          }));
  
        // Sort items by weighted score
        items.sort((a, b) => b.weighted_score - a.weighted_score);
  
        // Limit to 20 items
        const limitedItems = items.slice(0, 20);
  
        setPopularItems(prev => ({ ...prev, [mediaType]: limitedItems }));
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error('Error fetching popular items:', error);
      setError('Failed to fetch popular items');
    } finally {
      setIsLoading(false);
      setIsFetching(prev => ({ ...prev, [mediaType]: false }));
    }
  }, []);

  useEffect(() => {
    if (popularItems.movie.length === 0) {
      fetchPopularItems('movie');
    }
    if (popularItems.tv.length === 0) {
      fetchPopularItems('tv');
    }
  }, [fetchPopularItems, popularItems.movie.length, popularItems.tv.length]);

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
    <PopularContext.Provider value={{ 
      popularItems, 
      isLoading, 
      error, 
      fetchPopularItems,
      getWatchlistCount
    }}>
      {children}
    </PopularContext.Provider>
  );
};