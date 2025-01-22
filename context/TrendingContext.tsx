import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useTopWatchlist } from '@/context/TopWatchlistContext';
import { Media } from '@/types/types';

interface MediaState {
  data: Media[];
  page: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface TrendingContextType {
  trendingState: MediaState;
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
  const cache = useRef<Record<string, MediaState>>({});
  const initialFetchMade = useRef({ trending: false });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const getCacheKey = (prefix: string, ...params: string[]) => `${prefix}-${params.join('-')}`;
  
  const [trendingState, setTrendingState] = useState<MediaState>({
    data: [],
    page: 0,
    isLoading: false,
    error: null,
    hasMore: true,
  });

  const { getWatchlistCount } = useTopWatchlist();

  const fetchData = useCallback(async (
    endpoint: string,
    setState: React.Dispatch<React.SetStateAction<MediaState>>,
    params: Record<string, string>,
    resetPage: boolean = false
  ) => {
    const cacheKey = getCacheKey(endpoint, ...Object.values(params));

    setState(prev => {
      if (prev.isLoading || (!resetPage && !prev.hasMore)) return prev;
      return { ...prev, isLoading: true, error: null };
    });

    const nextPage = resetPage ? 1 : trendingState.page + 1;

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, page: nextPage }),
      });

      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      
      const data = await response.json();

      const resultsWithWatchlistCounts = await Promise.all(
        data.results.map(async (item: Media) => ({
          ...item,
          watchlist_count: await getWatchlistCount(item.id, item.media_type || 'movie'),
        }))
      );

      setState(prev => {
        // Create a Set of existing item IDs to prevent duplicates
        const existingIds = new Set(prev.data.map(item => `${item.id}-${item.media_type}`));
        
        // Filter out duplicates before adding new items
        const filteredResults = resultsWithWatchlistCounts.filter(item => 
          !existingIds.has(`${item.id}-${item.media_type}`)
        );
    
        const newState = {
          data: resetPage 
            ? resultsWithWatchlistCounts 
            : [...prev.data, ...filteredResults],
          page: nextPage,
          isLoading: false,
          error: null,
          hasMore: nextPage < data.total_pages,
        };
        cache.current[cacheKey] = newState;
        return newState;
      });

    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setState(prev => ({
        ...prev,
        error: `An error occurred while fetching ${endpoint}. Please try again.`,
        isLoading: false,
      }));
    }
  }, [getWatchlistCount, trendingState.page]);

  const fetchTrending = useCallback((resetPage: boolean = false) => 
    fetchData('trending', setTrendingState, { mediaType, timeWindow }, resetPage),
  [fetchData, mediaType, timeWindow]);

  const handleSetMediaType = useCallback((type: 'movie' | 'tv') => {
    if (type !== mediaType) {
      setMediaType(type);
      const cacheKey = getCacheKey('trending', type, timeWindow);
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
        initialFetchMade.current.trending = false;
      }
    }
  }, [mediaType, timeWindow]);

  const handleSetTimeWindow = useCallback((window: 'day' | 'week') => {
    if (window !== timeWindow) {
      setTimeWindow(window);
      const cacheKey = getCacheKey('trending', mediaType, window);
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
        initialFetchMade.current.trending = false;
      }
    }
  }, [mediaType, timeWindow]);

  useEffect(() => {
    if (!initialFetchMade.current.trending && trendingState.data.length === 0 && trendingState.hasMore) {
      setIsInitialLoading(true);
      initialFetchMade.current.trending = true;
      fetchTrending(true)
        .finally(() => setIsInitialLoading(false));
    }
  }, [trendingState, fetchTrending]);

  return (
    <TrendingContext.Provider 
      value={{ 
        trendingState, 
        mediaType, 
        timeWindow, 
        isInitialLoading,
        setMediaType: handleSetMediaType, 
        setTimeWindow: handleSetTimeWindow, 
        fetchTrending: () => fetchTrending(false)
      }}
    >
      {children}
    </TrendingContext.Provider>
  );
};

// Update the context interface
interface TrendingContextType {
  trendingState: MediaState;
  mediaType: 'movie' | 'tv';
  timeWindow: 'day' | 'week';
  isInitialLoading: boolean;
  setMediaType: (type: 'movie' | 'tv') => void;
  setTimeWindow: (window: 'day' | 'week') => void;
  fetchTrending: () => Promise<void>;
}