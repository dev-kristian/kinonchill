// context/PopularContext.tsx
'use client'

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
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

  const fetchPopularItems = useCallback(async (mediaType: 'movie' | 'tv') => {
    if (popularItems[mediaType].length > 0) return; // If we already have data, don't fetch again

    try {
      setIsLoading(true);
      setError(null);
      const itemsQuery = query(
        collection(db, mediaType === 'movie' ? 'movies' : 'tvShows'),
        where('vote_average', '>', 0),
        where('watchlist_count', '>', 0),
        limit(20)
      );

      const snapshot = await getDocs(itemsQuery);
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        const weighted_score = (data.vote_average * 1.3) + data.watchlist_count;
        return { ...data, media_type: mediaType, weighted_score } as PopularItem;
      });

      // Sort items by weighted score
      items.sort((a, b) => b.weighted_score - a.weighted_score);

      setPopularItems(prev => ({ ...prev, [mediaType]: items }));
    } catch (error) {
      console.error('Error fetching popular items:', error);
      setError('Failed to fetch popular items');
    } finally {
      setIsLoading(false);
    }
  }, [popularItems]);

  useEffect(() => {
    fetchPopularItems('movie');
    fetchPopularItems('tv');
  }, [fetchPopularItems]);

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