// components/PopularSection.tsx
'use client'
import React from 'react';
import { usePopular } from '@/context/PopularContext';
import MediaCarousel from './MediaCarousel';

const PopularSection: React.FC = () => {
  const { popularItems, isLoading, error, fetchPopularItems } = usePopular();
  const [mediaType, setMediaType] = React.useState<'movie' | 'tv'>('movie');

  return (
    <MediaCarousel
      title="Popular"
      items={popularItems[mediaType]}
      isLoading={isLoading}
      error={error}
      mediaType={mediaType}
      setMediaType={setMediaType}
      fetchItems={() => fetchPopularItems(mediaType)}
    />
  );
};

export default PopularSection;