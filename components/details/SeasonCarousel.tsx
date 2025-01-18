// components/SeasonCarousel.tsx
'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import FlickyEmbed from '@/components/details/FlickyEmbed';
import { Season, SeasonDetails } from '@/types/types';

interface SeasonCarouselProps {
  seasons: Season[];
  tmdbId: number;
  fetchSeasonDetails: (formData: FormData) => Promise<SeasonDetails | null>;
}

const SeasonCarousel: React.FC<SeasonCarouselProps> = ({ 
  seasons, 
  tmdbId,
  fetchSeasonDetails 
}) => {
  const [selectedSeasonDetails, setSelectedSeasonDetails] = useState<SeasonDetails | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<{
    seasonNumber: number;
    episodeNumber: number;
  } | null>(null);

  const handleSeasonSelect = async (seasonNumber: number) => {
    const formData = new FormData();
    formData.append('seasonNumber', seasonNumber.toString());
    
    try {
      const details = await fetchSeasonDetails(formData);
      setSelectedSeasonDetails(details);
    } catch (error) {
      console.error('Error selecting season:', error);
    }
  };

  const handleWatchNow = (seasonNumber: number, episodeNumber: number) => {
    setSelectedEpisode({ seasonNumber, episodeNumber });
  };

  const handleCloseEmbed = () => {
    setSelectedEpisode(null);
  };

  const validSeasons = seasons.filter(season => season.episode_count > 0);

  return (
    <div className="w-full">
      {/* Seasons Selector */}
      <motion.div 
        className="w-full overflow-x-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Seasons
        </h2>
        <div className="flex space-x-4 pb-4">
          {validSeasons.map((season) => (
            <motion.div 
              key={season.id} 
              className="flex-none w-40 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSeasonSelect(season.season_number)}
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
      </motion.div>

      {/* Season Details */}
      {selectedSeasonDetails && (
        <motion.div 
          className="mt-8 bg-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold mr-4">{selectedSeasonDetails.name}</h2>
            <span className="text-sm text-gray-400">
              Air Date: {selectedSeasonDetails.air_date}
            </span>
          </div>

          {/* Episode List */}
          <div className="space-y-4">
            {selectedSeasonDetails.episodes.map((episode) => (
              <motion.div 
                key={episode.id} 
                className="flex items-start bg-gray-700 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Episode Thumbnail */}
                <div className="relative w-32 h-20 flex-shrink-0">
                  {episode.still_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                      alt={episode.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Episode Details */}
                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Ep {episode.episode_number}: {episode.name}
                      </h3>
                      <p className="text-sm text-gray-400">{episode.air_date}</p>
                    </div>
                    
                    {/* Rating */}
                    {episode.vote_average > 0 && (
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm font-bold">
                          {episode.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Overview */}
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                    {episode.overview}
                  </p>

                  {/* Additional Details and Watch Now Button */}
                  <div className="flex justify-between items-center">
                    <div className="flex text-xs text-gray-400 space-x-2">
                      <span>
                        {episode.runtime ? `${episode.runtime} min` : 'Runtime N/A'}
                      </span>
                      <span>
                        {episode.vote_count > 0 
                          ? `${episode.vote_count} votes` 
                          : 'No votes'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleWatchNow(
                        selectedSeasonDetails.season_number, 
                        episode.episode_number
                      )}
                      className="bg-primary text-white text-xs px-3 py-1 rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Watch Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* FlickyEmbed Component */}
      {selectedEpisode && (
        <FlickyEmbed
          tmdbId={tmdbId}
          seasonNumber={selectedEpisode.seasonNumber}
          episodeNumber={selectedEpisode.episodeNumber}
          onClose={handleCloseEmbed}
        />
      )}
    </div>
  );
};

export default SeasonCarousel;