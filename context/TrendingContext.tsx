import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { usePopular } from './PopularContext';

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  watchlist_count?: number;
}

interface TrendingState {
  data: Media[];
  page: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface TrendingContextType {
  trendingState: TrendingState;
  mediaType: 'movie' | 'tv';
  timeWindow: 'day' | 'week';
  setMediaType: (type: 'movie' | 'tv') => void;
  setTimeWindow: (window: 'day' | 'week') => void;
  fetchTrending: () => Promise<void>;
}

const TrendingContext = createContext<TrendingContextType | undefined>(undefined);

export const useTrending = () => {
  const context = useContext(TrendingContext);
  if (context === undefined) {
    throw new Error('useTrending must be used within a TrendingProvider');
  }
  return context;
};

export const TrendingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');
  const cache = useRef<Record<string, TrendingState>>({});
  const initialFetchMade = useRef(false);

  const getCacheKey = (type: 'movie' | 'tv', window: 'day' | 'week') => `${type}-${window}`;

  const [trendingState, setTrendingState] = useState<TrendingState>({
    data: [],
    page: 0,
    isLoading: false,
    error: null,
    hasMore: true,
  });

  const { getWatchlistCount } = usePopular();

  const fetchTrending = useCallback(async (resetPage: boolean = false) => {
    const cacheKey = getCacheKey(mediaType, timeWindow);

    if (trendingState.isLoading || (!resetPage && !trendingState.hasMore)) return;

    setTrendingState(prev => ({ ...prev, isLoading: true, error: null }));

    const nextPage = resetPage ? 1 : trendingState.page + 1;

    try {
      const response = await fetch(`/api/trending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType,
          timeWindow,
          page: nextPage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trending ${mediaType}`);
      }
      const data = await response.json();

      // Fetch watchlist counts for each item
      const resultsWithWatchlistCounts = await Promise.all(
        data.results.map(async (item: Media) => {
          const watchlist_count = await getWatchlistCount(item.id, item.media_type);
          return { ...item, watchlist_count };
        })
      );

      const newState = {
        data: resetPage ? resultsWithWatchlistCounts : [...trendingState.data, ...resultsWithWatchlistCounts],
        page: nextPage,
        isLoading: false,
        error: null,
        hasMore: nextPage < data.total_pages,
      };

      setTrendingState(newState);
      cache.current[cacheKey] = newState;

    } catch (error) {
      console.error(`Error fetching trending ${mediaType}:`, error);
      setTrendingState(prev => ({
        ...prev,
        error: `An error occurred while fetching trending ${mediaType}. Please try again.`,
        isLoading: false,
      }));
    }
  }, [mediaType, timeWindow, trendingState, getWatchlistCount]);

  const handleSetMediaType = useCallback((type: 'movie' | 'tv') => {
    if (type !== mediaType) {
      setMediaType(type);
      const cacheKey = getCacheKey(type, timeWindow);
      if (cache.current[cacheKey]) {
        setTrendingState(cache.current[cacheKey]);
      } else {
        setTrendingState({
          data: [],
          page: 0,
          isLoading: false,
          error: null,
          hasMore: true,
        });
        initialFetchMade.current = false;
      }
    }
  }, [mediaType, timeWindow]);

  const handleSetTimeWindow = useCallback((window: 'day' | 'week') => {
    if (window !== timeWindow) {
      setTimeWindow(window);
      const cacheKey = getCacheKey(mediaType, window);
      if (cache.current[cacheKey]) {
        setTrendingState(cache.current[cacheKey]);
      } else {
        setTrendingState({
          data: [],
          page: 0,
          isLoading: false,
          error: null,
          hasMore: true,
        });
        initialFetchMade.current = false;
      }
    }
  }, [mediaType, timeWindow]);

  useEffect(() => {
    if (!initialFetchMade.current && trendingState.data.length === 0 && trendingState.hasMore) {
      initialFetchMade.current = true;
      fetchTrending(true);
    }
  }, [trendingState.data.length, trendingState.hasMore, fetchTrending]);

  return (
    <TrendingContext.Provider 
      value={{ 
        trendingState, 
        mediaType, 
        timeWindow, 
        setMediaType: handleSetMediaType, 
        setTimeWindow: handleSetTimeWindow, 
        fetchTrending: () => fetchTrending(false)
      }}
    >
      {children}
    </TrendingContext.Provider>
  );
};