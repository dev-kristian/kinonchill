// TvListSection.tsx
import React from 'react';
import { useTrending } from '@/context/TrendingContext';
import MediaCarousel from './MediaCarousel';

const TvListSection: React.FC = () => {
  const { tvListState, tvListType, setTvListType, fetchTvList } = useTrending();
  const { data, isLoading, error } = tvListState;

  return (
    <MediaCarousel
      title="TV Show List"
      items={data}
      isLoading={isLoading}
      error={error}
      mediaType="tv"
      fetchItems={fetchTvList}
      listType={tvListType}
      setListType={setTvListType}
    />
  );
};

export default TvListSection;