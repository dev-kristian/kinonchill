//app/(root)/explore/page.tsx

'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoviePoster from '@/components/MoviePoster';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/Spinner';
import { useSearch } from '@/context/SearchContext';
import TrendingSection from '@/components/TrendingSection';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchState, setSearchResults, setIsLoading, setError, clearSearch } = useSearch();
  const { results, isLoading, error } = searchState;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    clearSearch();

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="container mx-auto ">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Explore Movies and TV Shows
        </motion.h1>
        <TrendingSection />


        <h2 className="text-2xl font-bold mb-4">Search</h2>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Search'}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        )}
        
        {error && (
          <motion.p 
            className="text-destructive text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}

        <AnimatePresence>
          {results && results.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {results.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <MoviePoster movie={movie} />
                </motion.div>
              ))}
            </motion.div>
          ) : results ? (
            <motion.p 
              className="text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              No results found.
            </motion.p>
          ) : null}
        </AnimatePresence>

      </div>
  );
}