import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
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
  // Cache to store data for different mediaType and timeWindow combinations
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');

  const cache = useRef<Record<string, TrendingState>>({});

  const getCacheKey = (type: 'movie' | 'tv', window: 'day' | 'week') => `${type}-${window}`;

  const [trendingState, setTrendingState] = useState<TrendingState>(
    cache.current[getCacheKey(mediaType, timeWindow)] || {
      data: [],
      page: 0,
      isLoading: false,
      error: null,
      hasMore: true,
    }
  );

  const fetchTrending = useCallback(async () => {
    const cacheKey = getCacheKey(mediaType, timeWindow);

    if (trendingState.isLoading || !trendingState.hasMore) return;

    setTrendingState(prev => ({ ...prev, isLoading: true, error: null }));

    const nextPage = trendingState.page + 1;

    try {
      const response = await fetch(`/api/trending?mediaType=${mediaType}&timeWindow=${timeWindow}&page=${nextPage}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending ${mediaType}`);
      }
      const data = await response.json();

      const newState = {
        data: [...trendingState.data, ...data.results],
        page: nextPage,
        isLoading: false,
        error: null,
        hasMore: nextPage < data.total_pages,
      };

      setTrendingState(newState);
      cache.current[cacheKey] = newState; // Save fetched data in cache

    } catch (error) {
      console.error(`Error fetching trending ${mediaType}:`, error);
      setTrendingState(prev => ({
        ...prev,
        error: `An error occurred while fetching trending ${mediaType}. Please try again.`,
        isLoading: false,
      }));
    }
  }, [mediaType, timeWindow, trendingState]);

  const handleSetMediaType = (type: 'movie' | 'tv') => {
    if (type !== mediaType) {
      const cacheKey = getCacheKey(type, timeWindow);
      setMediaType(type);
      
      // Load state from cache or reset if not cached
      setTrendingState(cache.current[cacheKey] || {
        data: [],
        page: 0,
        isLoading: false,
        error: null,
        hasMore: true,
      });
    }
  };

  const handleSetTimeWindow = (window: 'day' | 'week') => {
    if (window !== timeWindow) {
      const cacheKey = getCacheKey(mediaType, window);
      setTimeWindow(window);

      // Load state from cache or reset if not cached
      setTrendingState(cache.current[cacheKey] || {
        data: [],
        page: 0,
        isLoading: false,
        error: null,
        hasMore: true,
      });
    }
  };

  return (
    <TrendingContext.Provider 
      value={{ 
        trendingState, 
        mediaType, 
        timeWindow, 
        setMediaType: handleSetMediaType, 
        setTimeWindow: handleSetTimeWindow, 
        fetchTrending 
      }}
    >
      {children}
    </TrendingContext.Provider>
  );
};
