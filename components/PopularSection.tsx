// components/PopularSection.tsx
'use client'
import React from 'react';
import { usePopular } from '@/context/PopularContext';
import MediaCarousel from './MediaCarousel';

const PopularSection: React.FC = () => {
  const { popularItems, isLoading, error } = usePopular();
  const [mediaType, setMediaType] = React.useState<'movie' | 'tv'>('movie');

  return (
    <MediaCarousel
      title='Friends Watchlist'
      items={popularItems[mediaType]}
      isLoading={isLoading}
      error={error}
      mediaType={mediaType}
      setMediaType={setMediaType}
    />
  );
};

export default PopularSection;