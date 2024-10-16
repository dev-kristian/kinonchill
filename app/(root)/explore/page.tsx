'use client'
import React from 'react';
import SearchComponent from '@/components/SearchComponent';
import TrendingSection from '@/components/TrendingSection';
import MovieListSection from '@/components/MovieListSection';
import TvListSection from '@/components/TvListSection';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Explore() {
  return (
    <div className="container-6xl mx-2 md:mx-6 mt-4">
      <AnimatedTitle>
        Explore Movies and TV Shows
      </AnimatedTitle>
      <SearchComponent className="mb-8" />
      <TrendingSection />
      <MovieListSection />
      <TvListSection />
    </div>
  );
}