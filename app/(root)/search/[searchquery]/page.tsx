'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoviePoster from '@/components/MoviePoster';
import Spinner from '@/components/Spinner';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/types';

export default function SearchResults() {
  const { searchquery } = useParams();
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchquery as string)}`, { signal });
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        if (!signal.aborted) {
          setResults(data.results);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error('Error searching movies:', error);
          setError('An error occurred while searching. Please try again.');
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      abortController.abort();
    };
  }, [searchquery]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">
          Search Results for "{searchquery}"
        </h1>
        <Link href="/explore">
          <Button variant="outline">
            Back to Explore
          </Button>
        </Link>
      </div>

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
            {results.map((movie: Movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <MoviePoster movie={movie} showMediaType={true} />
              </motion.div>
            ))}
          </motion.div>
        ) : !isLoading && (
          <motion.p 
            className="text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            No results found.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}