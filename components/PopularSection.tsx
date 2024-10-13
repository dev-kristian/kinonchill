// components/PopularSection.tsx
'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import MoviePoster from './MoviePoster';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import Spinner from './Spinner';
import { usePopular } from '@/context/PopularContext';

const PopularSection: React.FC = () => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const containerRef = useRef<HTMLDivElement>(null);
  const { popularItems, isLoading, error, fetchPopularItems } = usePopular();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20 && !isLoading) {
        // You might want to implement pagination or infinite scroll here
      }
    }
  }, [isLoading]);

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
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <button 
            onClick={() => fetchPopularItems(mediaType)} 
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
          {popularItems[mediaType].map((item) => (
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

export default PopularSection;