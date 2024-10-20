import React, { useState } from 'react';
import { useTopWatchlist } from '@/context/TopWatchlistContext';
import { TopWatchlistItem } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Users, Loader2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TopWatchlist: React.FC = () => {
  const { topWatchlistItems, isLoading, error } = useTopWatchlist();
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');

  const items: TopWatchlistItem[] = topWatchlistItems[mediaType].slice(0, 6);

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 text-white p-4 rounded-lg shadow-lg flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 text-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-red-400">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-950 to-gray-900 text-white p-2 rounded-2xl shadow-lg border-none mb-6 md:mb-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Top Watchlist</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <TrendingUp className="w-5 h-5 text-primary" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Most added to watchlists</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as 'movie' | 'tv')} className="mb-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/80">
          <TabsTrigger value="movie" className="text-sm">Movies</TabsTrigger>
          <TabsTrigger value="tv" className="text-sm">TV Shows</TabsTrigger>
        </TabsList>
      </Tabs>
      <AnimatePresence mode="wait">
        <motion.ul
          key={mediaType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 "
        >
          {items.map((item: TopWatchlistItem, index: number) => (
            <li
              key={item.id}
              className="bg-gradient-to-l from-gray-800 to-pink-900/50 rounded-lg overflow-hidden hover:bg-gray-700/50 transition-all duration-200 "
            >
              <Link href={`/details/${mediaType}/${item.id}`} className="flex items-center px-2 py-1 space-x-3">
                <div className="flex-shrink-0 w-12 h-16 relative rounded-md overflow-hidden">
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title || item.name || ''}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="transition-transform duration-300 hover:scale-110 object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0" >
                  <p className="font-semibold text-sm line-clamp-1">{item.title || item.name}</p>
                  <div className="flex items-center space-x-2 mt-1 text-xs">
                    <span className="flex items-center text-gray-300">
                      <Users size={10} className="mr-1" />
                      {item.watchlist_count || 'N/A'}
                    </span>
                    <span className="flex items-center text-yellow-400">
                      <Star size={10} className="mr-1" />
                      {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-6 h-6 bg-primary/50 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </Link>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
      <Link href="/top-watchlist">
        <Button
          className="mt-4 w-full bg-transparent hover:bg-transparent text-primary/70 hover:text-primary/70 shadow-none transition-colors duration-200"
        >
          See All
        </Button>
      </Link>
    </Card>
  );
};

export default TopWatchlist;