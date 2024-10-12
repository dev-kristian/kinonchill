import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

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
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');
  const cache = useRef<Record<string, TrendingState>>({});

  const getCacheKey = (type: 'movie' | 'tv', window: 'day' | 'week') => `${type}-${window}`;

  const [trendingState, setTrendingState] = useState<TrendingState>({
    data: [],
    page: 0,
    isLoading: false,
    error: null,
    hasMore: true,
  });

  const fetchTrending = useCallback(async (resetPage: boolean = false) => {
    const cacheKey = getCacheKey(mediaType, timeWindow);

    if (trendingState.isLoading || (!resetPage && !trendingState.hasMore)) return;

    setTrendingState(prev => ({ ...prev, isLoading: true, error: null }));

    const nextPage = resetPage ? 1 : trendingState.page + 1;

    try {
      const response = await fetch(`/api/trending?mediaType=${mediaType}&timeWindow=${timeWindow}&page=${nextPage}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending ${mediaType}`);
      }
      const data = await response.json();

      const newState = {
        data: resetPage ? data.results : [...trendingState.data, ...data.results],
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
  }, [mediaType, timeWindow, trendingState]);

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
      }
    }
  }, [mediaType, timeWindow]);

  useEffect(() => {
    if (trendingState.data.length === 0 && trendingState.hasMore) {
      fetchTrending(true);
    }
  }, [mediaType, timeWindow, trendingState.data.length, trendingState.hasMore, fetchTrending]);

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