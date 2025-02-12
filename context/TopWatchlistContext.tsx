// context/TopWatchlistContext.tsx
'use client'

import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TopWatchlistItem } from '@/types';
import { useUserData } from './UserDataContext';

interface TopWatchlistContextType {
  topWatchlistItems: {
    movie: TopWatchlistItem[];
    tv: TopWatchlistItem[];
  };
  setTopWatchlistItems: React.Dispatch<React.SetStateAction<{
    movie: TopWatchlistItem[];
    tv: TopWatchlistItem[];
  }>>;
  isLoading: boolean;
  error: string | null;
  fetchTopWatchlistItems: (mediaType: 'movie' | 'tv') => Promise<void>;
}

const TopWatchlistContext = createContext<TopWatchlistContextType | undefined>(undefined);

export const useTopWatchlist = () => {
  const context = useContext(TopWatchlistContext);
  if (!context) {
    throw new Error('useTopWatchlist must be used within a TopWatchlistProvider');
  }
  return context;
};

interface FirestoreWatchlistItem {
  id: number;
  media_type: 'movie' | 'tv';
  poster_path?: string;
  release_date?: string;
  title?: string;
  vote_average?: number;
  [key: string]: any; // To allow other potential fields from Firestore
}


export const TopWatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topWatchlistItems, setTopWatchlistItems] = useState<{ movie: TopWatchlistItem[]; tv: TopWatchlistItem[] }>({
    movie: [],
    tv: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState({ movie: false, tv: false });
  const topWatchlistItemsRef = useRef(topWatchlistItems);
  const { userData, friends, isLoadingFriends, isLoadingRequests } = useUserData();

  useEffect(() => {
    topWatchlistItemsRef.current = topWatchlistItems;
  }, [topWatchlistItems]);

  // No need for getWatchlistCount anymore

  const fetchTopWatchlistItemsForUser = useCallback(async (userId: string, mediaType: 'movie' | 'tv'): Promise<FirestoreWatchlistItem[]> => { // Changed return type
    try {
      const docRef = doc(db, 'watchlists', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return (data[mediaType] || []) as FirestoreWatchlistItem[]; // Return raw Firestore items
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching topWatchlist items for user ${userId}:`, error);
      return [];
    }
  }, []);


  const fetchTopWatchlistItems = useCallback(async (mediaType: 'movie' | 'tv') => {
    if (topWatchlistItemsRef.current[mediaType].length > 0 || isFetching[mediaType]) {
      return;
    }

    setIsFetching(prev => ({ ...prev, [mediaType]: true }));
    setIsLoading(true);
    setError(null);

    try {
      const watchlistCounts: { [id: number]: number } = {}; // Store counts here
      let allUserItems: FirestoreWatchlistItem[] = [];  // Use FirestoreWatchlistItem

      if (userData?.uid) {
        const userItems = await fetchTopWatchlistItemsForUser(userData.uid, mediaType);
        allUserItems = [...allUserItems, ...userItems];
      }

      if (friends) {
        const friendsItemsPromises = friends.map(friend => fetchTopWatchlistItemsForUser(friend.uid, mediaType));
        const friendsItemsResults = await Promise.all(friendsItemsPromises);
        friendsItemsResults.forEach(items => {
          allUserItems = [...allUserItems, ...items];
        });
      }

      // Count occurrences *and* filter invalid data
      const filteredAndCountedItems: TopWatchlistItem[] = [];
      allUserItems.forEach(item => {
        if (item.media_type === mediaType && item.vote_average !== undefined && item.vote_average > 0) {
          watchlistCounts[item.id] = (watchlistCounts[item.id] || 0) + 1;

          // Check if item already exists before pushing
          if (!filteredAndCountedItems.find(existingItem => existingItem.id === item.id)) {
            filteredAndCountedItems.push({
              ...item,
              weighted_score: item.vote_average
            });
          }
        }
      });

      // Sort by vote_average (descending)
      filteredAndCountedItems.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

      // Apply watchlist_count and limit to top 20
      const topItems: TopWatchlistItem[] = filteredAndCountedItems.slice(0, 20).map(item => ({
        ...item,
        watchlist_count: watchlistCounts[item.id],
      }));

      setTopWatchlistItems(prev => ({ ...prev, [mediaType]: topItems }));

    } catch (error) {
      console.error('Error fetching aggregated topWatchlist items:', error);
      setError(`Failed to fetch topWatchlist items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsFetching(prev => ({ ...prev, [mediaType]: false }));
    }
  }, [userData?.uid, friends, fetchTopWatchlistItemsForUser, isFetching]);  // Simplified dependencies


  useEffect(() => {
    if (userData && !isLoading && !isLoadingFriends && !isLoadingRequests) {
      if (topWatchlistItems.movie.length === 0 && !isFetching.movie) {
        fetchTopWatchlistItems('movie');
      }
      if (topWatchlistItems.tv.length === 0 && !isFetching.tv) {
        fetchTopWatchlistItems('tv');
      }
    }
  }, [fetchTopWatchlistItems, topWatchlistItems.movie.length, topWatchlistItems.tv.length, isLoading, userData, isFetching.movie, isFetching.tv, isLoadingFriends, isLoadingRequests, friends]);

  return (
    <TopWatchlistContext.Provider value={{
      topWatchlistItems,
      setTopWatchlistItems,
      isLoading,
      error,
      fetchTopWatchlistItems,
    }}>
      {children}
    </TopWatchlistContext.Provider>
  );
};