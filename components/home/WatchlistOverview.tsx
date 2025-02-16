// components/home/WatchlistOverview.tsx
'use client'

import React, { useState } from 'react';
import { useUserData } from '@/context/UserDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Media } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WatchlistOverview() {
  const { watchlistItems, removeFromWatchlist } = useUserData();
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = watchlistItems[mediaType]
    .filter(item => 
      (item.title || item.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .slice(0, 6); // Show only first 6 items

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Your Watchlist</h2>
          <p className="text-sm text-gray-400">
            {watchlistItems[mediaType].length} items saved
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 rounded-full"
            />
          </div>

          <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as 'movie' | 'tv')}>
            <TabsList className="bg-white/5">
              <TabsTrigger value="movie">Movies</TabsTrigger>
              <TabsTrigger value="tv">TV Shows</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {filteredItems.map((item) => (
              <WatchlistCard key={item.id} item={item} mediaType={mediaType} />
            ))}
          </motion.div>
        ) : (
          <EmptyState mediaType={mediaType} />
        )}
      </AnimatePresence>

      {watchlistItems[mediaType].length > 6 && (
        <div className="text-center">
          <Link href="/watchlist">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All ({watchlistItems[mediaType].length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

const WatchlistCard = ({ item, mediaType }: { item: Media; mediaType: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { removeFromWatchlist } = useUserData();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/details/${mediaType}/${item.id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
          <Image
            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
            alt={item.title || item.name || ''}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              isHovered && "scale-105 brightness-50"
            )}
          />
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-4 flex flex-col justify-end"
              >
                <div className="space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{item.vote_average?.toFixed(1)}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full bg-white/10 hover:bg-white/20"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWatchlist(item.id, mediaType as 'movie' | 'tv');
                    }}
                  >
                    <Heart className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  );
};

const EmptyState = ({ mediaType }: { mediaType: string }) => (
  <div className="text-center py-12">
    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
    <h3 className="text-lg font-medium mb-2">No items in your watchlist</h3>
    <p className="text-gray-400 mb-4">
      Start adding {mediaType === 'movie' ? 'movies' : 'TV shows'} to keep track
    </p>
    <Link href={`/discover/${mediaType}`}>
      <Button>Browse {mediaType === 'movie' ? 'Movies' : 'Shows'}</Button>
    </Link>
  </div>
);
