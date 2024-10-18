// components/TrendingSection.tsx
import React from 'react';
import { useTrending } from '@/context/TrendingContext';
import MediaCarousel from '@/components/MediaCarousel';

const TrendingSection: React.FC = () => {
  const { trendingState, mediaType, timeWindow, setMediaType, setTimeWindow, fetchTrending } = useTrending();
  const { data, isLoading, error } = trendingState;

  return (
    <MediaCarousel
      title="Trending"
      items={data}
      isLoading={isLoading}
      error={error}
      mediaType={mediaType}
      setMediaType={setMediaType}
      fetchItems={fetchTrending}
      timeWindow={timeWindow}
      setTimeWindow={setTimeWindow}
    />
  );
};

export default TrendingSection;