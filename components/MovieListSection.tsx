import React from 'react';
import { useTrending } from '@/context/TrendingContext';
import MediaCarousel from './MediaCarousel';

const MovieListSection: React.FC = () => {
  const { movieListState, movieListType, setMovieListType, fetchMovieList } = useTrending();
  const { data, isLoading, error } = movieListState;

  return (
    <MediaCarousel
      title="Movies"
      items={data}
      isLoading={isLoading}
      error={error}
      mediaType="movie"
      setMediaType={() => {}}
      fetchItems={fetchMovieList}
      listType={movieListType}
      setListType={setMovieListType}
    />
  );
};

export default MovieListSection;