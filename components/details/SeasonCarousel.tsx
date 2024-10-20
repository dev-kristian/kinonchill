// SeasonCarousel.tsx
'use client'
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Season } from '@/types/types';

interface SeasonCarouselProps {
  seasons: Season[];
}

const SeasonCarousel: React.FC<SeasonCarouselProps> = ({ seasons }) => {
  const validSeasons = seasons.filter(season => season.episode_count > 0);

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-start mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Seasons
      </h2>
      <div className="overflow-x-auto py-4 md:px-2">
        <div className="flex space-x-4">
          {validSeasons.map((season) => (
            <motion.div 
              key={season.id} 
              className="flex-none w-40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md">
                {season.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                    alt={season.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold">{season.name}</h3>
              <p className="text-xs text-gray-400">{season.episode_count} episodes</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SeasonCarousel;