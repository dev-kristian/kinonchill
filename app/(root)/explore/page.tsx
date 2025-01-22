'use client'
import React from 'react';
import SearchComponent from '@/components/explore/SearchComponent';
import TrendingSection from '@/components/explore/TrendingSection';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Explore() {
  return (
    <div className="container-full mx-2 md:mx-4 mt-4">
      <AnimatedTitle>
        {(className) => (
          <>
            <span className={className}>Explore </span>
            <span className="text-primary/50">Movies</span>
            <span className={className}> and </span>
            <span className="text-primary/50">TV Shows</span>
          </>
        )}
      </AnimatedTitle>
      <SearchComponent className="mb-8" />
      <TrendingSection />
    </div>
  );
}