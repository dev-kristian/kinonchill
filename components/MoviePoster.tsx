'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthContext } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
}

interface MoviePosterProps {
  movie: Movie;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ movie }) => {
  const { user } = useAuthContext();
  const { userData, isLoading: isUserDataLoading, addWatchedMovie, removeWatchedMovie } = useUserData();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const isWatched = userData?.watchedMovies[movie.id.toString()] || false;

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleToggleWatched = async () => {
    if (!user) {
      setAlertMessage('Please log in to mark movies as watched.');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isWatched) {
        await removeWatchedMovie(movie.id);
        setAlertMessage('Movie removed from watched list.');
      } else {
        await addWatchedMovie(movie.id);
        setAlertMessage('Movie marked as watched successfully!');
      }
    } catch (error) {
      console.error('Error updating watched status:', error);
      setAlertMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setShowAlert(true);
    }
  };

  // Determine the correct title and release date fields based on media type
  const title = movie.media_type === 'movie' || movie.media_type === 'tv' ? movie.title || movie.name : movie.name;
  const releaseDate = movie.media_type === 'movie' ? movie.release_date : movie.first_air_date;

  // Determine the correct image path
  const imagePath = movie.media_type === 'person' ? movie.profile_path : movie.poster_path;

  // Determine color coding based on media type
  const getBadgeColor = () => {
    switch (movie.media_type) {
      case 'movie':
        return 'bg-blue-500';
      case 'tv':
        return 'bg-green-500';
      case 'person':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div 
      className="relative rounded-lg overflow-hidden shadow-lg bg-background-light"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      {imagePath ? (
        <>
          <Image
            src={`https://image.tmdb.org/t/p/w500${imagePath}`}
            alt={title || 'Untitled'}
            width={500}
            height={750}
            className="w-full h-auto object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </>
      ) : (
        <div className="w-full h-[300px] bg-secondary flex items-center justify-center">
          <span className="text-foreground text-lg">No Image Available</span>
        </div>
      )}
      <div className="absolute top-2 right-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={handleToggleWatched}
                disabled={isLoading || isUserDataLoading}
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 ${
                  isWatched ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <img
                  src="/icons/eye.svg" // Path to your SVG in the public folder
                  alt="eye icon"
                  width={24}
                  height={24}
                />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isWatched ? 'Remove from watched' : 'Mark as watched'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-transparent to-transparent">
        <h2 className="text-lg font-semibold text-white mb-2 truncate">{title}</h2>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-medium py-1 px-2 rounded ${getBadgeColor()}`}>{movie.media_type}</span>
          {releaseDate && <span className="text-muted-foreground text-sm text-white">{releaseDate}</span>}
        </div>
      </div>
      {showAlert && (
        <Alert className="absolute bottom-0 left-0 right-0 m-2 bg-background/80 backdrop-blur-sm">
          <AlertTitle>{alertMessage}</AlertTitle>
        </Alert>
      )}
    </motion.div>
  );
};

export default MoviePoster;