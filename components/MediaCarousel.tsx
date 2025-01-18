import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import MoviePoster from './MoviePoster';
import Spinner from './Spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Media } from '@/types/types';

interface MediaCarouselProps {
  title?: string;
  items: Media[];
  isLoading: boolean;
  showMediaTypeTabs?: boolean;
  error: string | null;
  fetchItems?: () => void;
  mediaType: 'movie' | 'tv';
  setMediaType?: (type: 'movie' | 'tv') => void;
  timeWindow?: 'day' | 'week';
  setTimeWindow?: (window: 'day' | 'week') => void;
  listType?: 'popular' | 'top_rated';
  setListType?: (type: 'popular' | 'top_rated') => void;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  items,
  isLoading,
  error,
  fetchItems,
  mediaType,
  setMediaType,
  timeWindow,
  setTimeWindow,
  listType,
  setListType
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current!.offsetLeft);
    setScrollLeft(containerRef.current!.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoading && items.length === 0 && fetchItems) {
        fetchItems();
      }
    },
    [isLoading, fetchItems, items.length]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
  
    const currentSentinelRef = sentinelRef.current;
  
    if (currentSentinelRef) {
      observer.observe(currentSentinelRef);
    }
  
    return () => {
      if (currentSentinelRef) {
        observer.unobserve(currentSentinelRef);
      }
    };
  }, [handleObserver]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <button onClick={fetchItems} className="ml-2 underline">
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-gradient-to-t from-transparent to-gray-900/50 text-white py-2 rounded-2xl shadow-lg my-2">
      <div className='flex flex-col md:flex-row'>
      {title && <h2 className="md:text-2xl font-bold mb-2 px-4">{title}</h2>}
      <div className="flex flex-row gap-2 pl-2 md:px-4">
        {setMediaType && (
          <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as 'movie' | 'tv')} className="mb-4 md:mb-0">
            <TabsList>
              <TabsTrigger value="movie">Movies</TabsTrigger>
              <TabsTrigger value="tv">TV Shows</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {setTimeWindow && timeWindow && (
          <Tabs value={timeWindow} onValueChange={(value) => setTimeWindow(value as 'day' | 'week')} className="mb-4 md:mb-0">
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {setListType && listType && (
          <Tabs value={listType} onValueChange={(value) => setListType(value as 'popular' | 'top_rated')} className="mb-4 md:mb-0">
            <TabsList>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      </div>
      <div
        className="mx-2 overflow-x-auto md:p-2 cursor-grab active:cursor-grabbing no-scrollbar"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
          MozUserSelect: 'none'
        }}
      >
        <motion.div
          className="flex space-x-2"
          style={{ minWidth: 'max-content' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-none w-48">
              <MoviePoster movie={{...item, media_type: item.media_type || mediaType}} />
            </div>
          ))}
          {isLoading && (
            <div className="flex-none w-48 flex justify-center items-center">
              <Spinner size="lg" />
            </div>
          )}
          <div ref={sentinelRef} className="w-1 h-1" />
        </motion.div>
      </div>
    </div>
  );
};

export default MediaCarousel;