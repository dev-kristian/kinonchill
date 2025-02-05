'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useUserData } from '@/context/UserDataContext';
import { Media } from '@/types/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Loader2, ChevronLeft, ChevronRight, Search, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const UserWatchlist: React.FC = () => {
  const { watchlistItems, isLoading, removeFromWatchlist } = useUserData();
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('rating');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setRightButton] = useState(true);
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({
    movie: 0,
    tv: 0
  });

  const filteredAndSortedItems = useMemo(() => {
    let items = [...watchlistItems[mediaType]];
    
    if (searchQuery) {
      items = items.filter(item => 
        (item.title || item.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return items.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'date':
          return new Date(b.release_date || b.first_air_date || 0).getTime() -
                 new Date(a.release_date || a.first_air_date || 0).getTime();
        case 'title':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        default:
          return 0;
      }
    });
  }, [watchlistItems, mediaType, searchQuery, sortBy]);

  const handleScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftButton(scrollLeft > 0);
      setRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Save scroll position for current media type
      setScrollPositions(prev => ({
        ...prev,
        [mediaType]: scrollLeft
      }));
    }
  }, [mediaType]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle media type change
  const handleMediaTypeChange = useCallback((value: string) => {
    setMediaType(value as 'movie' | 'tv');
    // Restore scroll position after a brief delay to ensure DOM update
    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft = scrollPositions[value as 'movie' | 'tv'] || 0;
        handleScroll();
      }
    }, 0);
  }, [scrollPositions, handleScroll]);

  useEffect(() => {
    // Initial scroll position check
    handleScroll();
  }, [filteredAndSortedItems, handleScroll]);

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 text-white p-4 rounded-lg shadow-lg flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </Card>
    );
  }

  const getFormattedDate = (item: Media) => {
    const date = item.release_date || item.first_air_date;
    if (!date) return 'Release date unknown';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const handleRemoveWithToast = async (id: number, title: string) => {
    await removeFromWatchlist(id, mediaType);
    toast({
      title: "Removed from watchlist",
      description: `${title} has been removed from your watchlist.`,
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-950 to-gray-900 p-4 rounded-2xl border-none shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Watchlist</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Heart className="w-5 h-5 text-primary" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your personal watchlist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Tabs 
            value={mediaType} 
            onValueChange={handleMediaTypeChange} 
            className="flex-shrink-0"
          >
            <TabsList className="grid w-full md:w-48 grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="movie" className="data-[state=active]:bg-primary">
                Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="data-[state=active]:bg-primary">
                TV Shows
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-grow flex gap-3">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search your watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 focus:border-primary"
              />
            </div>

            <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-[160px] bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="date">Latest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAndSortedItems.length > 0 ? (
          <div className="relative group">
          <AnimatePresence>
            {showLeftButton && filteredAndSortedItems.length > 4 && (
              <motion.div
                key="left-button"  // Add this key
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-800/90 hover:bg-gray-700/90"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
        
            {showRightButton && filteredAndSortedItems.length > 4 && (
              <motion.div
                key="right-button"  // Add this key
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-800/90 hover:bg-gray-700/90"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
              onScroll={handleScroll}
            >
              {filteredAndSortedItems.map((item) => (
                <CarouselItem
                  key={item.id}
                  item={item}
                  mediaType={mediaType}
                  hoveredItem={hoveredItem}
                  setHoveredItem={setHoveredItem}
                  onRemove={() => handleRemoveWithToast(item.id, item.title || item.name || '')}
                  getFormattedDate={getFormattedDate}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState mediaType={mediaType} />
        )}

        <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400">
          <span>{filteredAndSortedItems.length} items in watchlist</span>
          <span>
            {mediaType === 'movie' ? 'Movies' : 'TV Shows'} • Sorted by {sortBy}
          </span>
        </div>
      </Card>
    </div>
  );
};

const CarouselItem: React.FC<{
  item: Media;
  mediaType: 'movie' | 'tv';
  hoveredItem: number | null;
  setHoveredItem: (id: number | null) => void;
  onRemove: () => void;
  getFormattedDate: (item: Media) => string;
}> = ({ item, mediaType, hoveredItem, setHoveredItem, onRemove, getFormattedDate }) => (
  <Link 
    href={`/details/${mediaType}/${item.id}`}
    className="group relative flex-shrink-0"
    onMouseEnter={() => setHoveredItem(item.id)}
    onMouseLeave={() => setHoveredItem(null)}
  >
    <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden bg-gray-800">
      {item.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
          alt={item.title || item.name || ''}
          fill
          sizes="200px"
          className={cn(
            "object-cover transition-all duration-300",
            hoveredItem === item.id ? "scale-110 opacity-40" : "scale-100"
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      {/* Info Overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent",
          hoveredItem === item.id ? "opacity-100" : "opacity-0",
          "transition-opacity duration-300"
        )}
      >
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {item.title || item.name}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{getFormattedDate(item)}</span>
          </div>

          <Button 
            variant="secondary"
            size="sm"
            className="w-full mt-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
          >
            <Heart className="w-4 h-4 mr-2 fill-current" /> Remove
          </Button>
        </div>
      </div>
    </div>
  </Link>
);

const EmptyState: React.FC<{ mediaType: 'movie' | 'tv' }> = ({ mediaType }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-gray-800/50 rounded-full mb-4">
      <Heart className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
    <p className="text-gray-400 mb-4">
      Start adding {mediaType === 'movie' ? 'movies' : 'TV shows'} to keep track of what you want to watch
    </p>
    <Link href={`/discover/${mediaType}`}>
      <Button variant="default">
        Discover {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </Button>
    </Link>
  </div>
);

export default UserWatchlist;