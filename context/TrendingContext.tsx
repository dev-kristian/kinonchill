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
  movieListState: MediaState;
  tvListState: MediaState;
  mediaType: 'movie' | 'tv';
  timeWindow: 'day' | 'week';
  movieListType: 'popular' | 'top_rated';
  tvListType: 'popular' | 'top_rated';
  setMediaType: (type: 'movie' | 'tv') => void;
  setTimeWindow: (window: 'day' | 'week') => void;
  setMovieListType: (type: 'popular' | 'top_rated') => void;
  setTvListType: (type: 'popular' | 'top_rated') => void;
  fetchTrending: () => Promise<void>;
  fetchMovieList: () => Promise<void>;
  fetchTvList: () => Promise<void>;
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
  const [movieListType, setMovieListType] = useState<'popular' | 'top_rated'>('popular');
  const [tvListType, setTvListType] = useState<'popular' | 'top_rated'>('popular');
  const cache = useRef<Record<string, MediaState>>({});
  const initialFetchMade = useRef({ trending: false, movieList: false, tvList: false });

  const getCacheKey = (prefix: string, ...params: string[]) => `${prefix}-${params.join('-')}`;

  const [trendingState, setTrendingState] = useState<MediaState>({
    data: [],
    page: 0,
    isLoading: false,
    error: null,
    hasMore: true,
  });

  const [movieListState, setMovieListState] = useState<MediaState>({
    data: [],
    page: 0,
    isLoading: false,
    error: null,
    hasMore: true,
  });

  const [tvListState, setTvListState] = useState<MediaState>({
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

    const nextPage = resetPage ? 1 : (setState === setTrendingState ? trendingState.page : 
                                      setState === setMovieListState ? movieListState.page : 
                                      tvListState.page) + 1;

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
          watchlist_count: await getWatchlistCount(item.id, item.media_type || (endpoint === 'tv-list' ? 'tv' : 'movie')),
        }))
      );

      setState(prev => {
        const newState = {
          data: resetPage ? resultsWithWatchlistCounts : [...prev.data, ...resultsWithWatchlistCounts],
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
  }, [getWatchlistCount, trendingState.page, movieListState.page, tvListState.page]);

  const fetchTrending = useCallback((resetPage: boolean = false) => 
    fetchData('trending', setTrendingState, { mediaType, timeWindow }, resetPage),
  [fetchData, mediaType, timeWindow]);

  const fetchMovieList = useCallback((resetPage: boolean = false) => 
    fetchData('movie-list', setMovieListState, { type: movieListType }, resetPage),
  [fetchData, movieListType]);

  const fetchTvList = useCallback((resetPage: boolean = false) => 
    fetchData('tv-list', setTvListState, { type: tvListType }, resetPage),
  [fetchData, tvListType]);

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

  const handleSetMovieListType = useCallback((type: 'popular' | 'top_rated') => {
    if (type !== movieListType) {
      setMovieListType(type);
      const cacheKey = getCacheKey('movie-list', type);
      if (cache.current[cacheKey]) {
        setMovieListState(cache.current[cacheKey]);
      } else {
        setMovieListState({
          data: [],
          page: 0,
          isLoading: false,
          error: null,
          hasMore: true,
        });
        initialFetchMade.current.movieList = false;
      }
    }
  }, [movieListType]);

  const handleSetTvListType = useCallback((type: 'popular' | 'top_rated') => {
    if (type !== tvListType) {
      setTvListType(type);
      const cacheKey = getCacheKey('tv-list', type);
      if (cache.current[cacheKey]) {
        setTvListState(cache.current[cacheKey]);
      } else {
        setTvListState({
          data: [],
          page: 0,
          isLoading: false,
          error: null,
          hasMore: true,
        });
        initialFetchMade.current.tvList = false;
      }
    }
  }, [tvListType]);

  useEffect(() => {
    if (!initialFetchMade.current.trending && trendingState.data.length === 0 && trendingState.hasMore) {
      initialFetchMade.current.trending = true;
      fetchTrending(true);
    }
    if (!initialFetchMade.current.movieList && movieListState.data.length === 0 && movieListState.hasMore) {
      initialFetchMade.current.movieList = true;
      fetchMovieList(true);
    }
    if (!initialFetchMade.current.tvList && tvListState.data.length === 0 && tvListState.hasMore) {
      initialFetchMade.current.tvList = true;
      fetchTvList(true);
    }
  }, [trendingState, movieListState, tvListState, fetchTrending, fetchMovieList, fetchTvList]);

  return (
    <TrendingContext.Provider 
      value={{ 
        trendingState, 
        movieListState,
        tvListState,
        mediaType, 
        timeWindow, 
        movieListType,
        tvListType,
        setMediaType: handleSetMediaType, 
        setTimeWindow: handleSetTimeWindow, 
        setMovieListType: handleSetMovieListType,
        setTvListType: handleSetTvListType,
        fetchTrending: () => fetchTrending(false),
        fetchMovieList: () => fetchMovieList(false),
        fetchTvList: () => fetchTvList(false)
      }}
    >
      {children}
    </TrendingContext.Provider>
  );
};