// components/TopWatchlistSection.tsx
'use client'
import React from 'react';
import { useTopWatchlist } from '@/context/TopWatchlistContext';
import MediaCarousel from '@/components/MediaCarousel';

const TopWatchlistSection: React.FC = () => {
  const { topWatchlistItems, isLoading, error } = useTopWatchlist();
  const [mediaType, setMediaType] = React.useState<'movie' | 'tv'>('movie');

  return (
    <MediaCarousel
      title='Top Watchlisted'
      items={topWatchlistItems[mediaType]}
      isLoading={isLoading}
      error={error}
      mediaType={mediaType}
      setMediaType={setMediaType}
    />
  );
};

export default TopWatchlistSection;