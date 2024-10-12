import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import MoviePoster from './MoviePoster';
import Spinner from './Spinner';
import { useTrending } from '@/context/TrendingContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TrendingSection: React.FC = () => {
  const { trendingState, mediaType, timeWindow, setMediaType, setTimeWindow, fetchTrending } = useTrending();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading, error, hasMore } = trendingState;

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20 && !isLoading && hasMore) {
        fetchTrending();
      }
    }
  }, [fetchTrending, isLoading, hasMore]);

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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [mediaType, timeWindow]);

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
    const walk = (x - startX) * 2; // Adjust scrolling speed
    containerRef.current!.scrollLeft = scrollLeft - walk;
  };

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Trending</h2>
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <Tabs defaultValue={mediaType} className="mb-4 md:mb-0">
          <TabsList>
            <TabsTrigger value="movie" onClick={() => setMediaType('movie')}>Movies</TabsTrigger>
            <TabsTrigger value="tv" onClick={() => setMediaType('tv')}>TV Shows</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs defaultValue={timeWindow}>
          <TabsList>
            <TabsTrigger value="day" onClick={() => setTimeWindow('day')}>Today</TabsTrigger>
            <TabsTrigger value="week" onClick={() => setTimeWindow('week')}>This Week</TabsTrigger>
          </TabsList>
        </Tabs>
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
          {data.map((item) => (
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

export default TrendingSection;