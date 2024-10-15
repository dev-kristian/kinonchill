'use client'
import React from 'react';
import { motion } from 'framer-motion';
import SearchComponent from '@/components/SearchComponent';
import TrendingSection from '@/components/TrendingSection';
import MovieListSection from '@/components/MovieListSection';
import TvListSection from '@/components/TvListSection';

export default function Explore() {
  return (
    <div className="container-6xl mx-2 md:mx-6 mt-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-foreground"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Explore Movies and TV Shows
      </motion.h1>
      <SearchComponent className="mb-8" />
      <TrendingSection />
      <MovieListSection />
      <TvListSection />
    </div>
  );
}