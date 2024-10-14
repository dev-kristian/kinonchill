// components/MediaCarousel.tsx
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MoviePoster from './MoviePoster';
import Spinner from './Spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string; 
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  watchlist_count?: number;
}

interface MediaCarouselProps {
  title?: string;
  items: MediaItem[];
  isLoading: boolean;
  error: string | null;
  mediaType: 'movie' | 'tv';
  setMediaType: (type: 'movie' | 'tv') => void;
  fetchItems: () => void;
  timeWindow?: 'day' | 'week';
  setTimeWindow?: (window: 'day' | 'week') => void;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  title,
  items,
  isLoading,
  error,
  mediaType,
  setMediaType,
  fetchItems,
  timeWindow,
  setTimeWindow
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current!.offsetLeft);
    setScrollLeft(containerRef.current!.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current!.scrollLeft = scrollLeft - walk;
  };

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
    <div className="mb-8">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as 'movie' | 'tv')} className="mb-4 md:mb-0">
          <TabsList>
            <TabsTrigger value="movie">Movies</TabsTrigger>
            <TabsTrigger value="tv">TV Shows</TabsTrigger>
          </TabsList>
        </Tabs>
        {timeWindow && setTimeWindow && (
          <Tabs value={timeWindow} onValueChange={(value) => setTimeWindow(value as 'day' | 'week')}>
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <div
        className="overflow-x-auto py-6 px-4 cursor-grab active:cursor-grabbing"
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
          className="flex space-x-4"
          style={{ minWidth: 'max-content' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-none w-48">
              <MoviePoster movie={item} />
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

export default MediaCarousel;