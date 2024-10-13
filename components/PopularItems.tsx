
'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MoviePoster from './MoviePoster';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

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

const PopularItems: React.FC = () => {
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPopularItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const itemsQuery = query(
        collection(db, mediaType === 'movie' ? 'movies' : 'tvShows'),
        where('vote_average', '>', 0),
        where('watchlist_count', '>', 0),
        limit(20)
      );

      const snapshot = await getDocs(itemsQuery);
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        const weighted_score = (data.vote_average * 1.2) + data.watchlist_count;
        return { ...data, media_type: mediaType, weighted_score } as PopularItem;
      });

      // Sort items by weighted score
      items.sort((a, b) => b.weighted_score - a.weighted_score);

      setPopularItems(items);
      setHasMore(items.length === 20);
    } catch (error) {
      console.error('Error fetching popular items:', error);
      setError('Failed to fetch popular items');
    } finally {
      setIsLoading(false);
    }
  }, [mediaType]);

  useEffect(() => {
    fetchPopularItems();
  }, [fetchPopularItems]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20 && !isLoading && hasMore) {
        // Implement pagination logic here if needed
      }
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <button 
            onClick={() => fetchPopularItems()} 
            className="ml-2 underline"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mb-8">
      <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as 'movie' | 'tv')} className="mb-4">
        <TabsList>
          <TabsTrigger value="movie">Movies</TabsTrigger>
          <TabsTrigger value="tv">TV Shows</TabsTrigger>
        </TabsList>
      </Tabs>
      <div 
        className="overflow-x-auto pb-4 px-4" 
        ref={containerRef}
      >
        <motion.div 
          className="flex space-x-4" 
          style={{ minWidth: 'max-content' }}
        >
          {popularItems.map((item) => (
            <div key={item.id} className="flex-none w-48">
              <MoviePoster movie={item} />
              <div className="mt-2 text-sm text-center">
                <div><span className="font-bold">{item.watchlist_count}</span> watchlists</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex-none w-48 flex justify-center items-center">
              <Spinner size="lg" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PopularItems;