import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthContext } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { MediaItem } from '@/types/media';

interface MoviePosterProps {
  media: MediaItem;
  showMediaType?: boolean;
  onClick?: () => void;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ media, showMediaType = false, onClick }) => {
  const { user } = useAuthContext();
  const { userData, isLoading: isUserDataLoading, addWatchedMovie, removeWatchedMovie } = useUserData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');

  const isWatched = userData?.watchedMovies[media.id.toString()] || false;

  React.useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    if (!user) {
      setAlertMessage('Please log in to mark movies as watched.');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isWatched) {
        await removeWatchedMovie(media.id);
        setAlertMessage('Movie removed from watched list.');
      } else {
        await addWatchedMovie(media.id);
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

  const title = media.title || media.name || 'Untitled';
  const imagePath = media.poster_path || media.profile_path;
  const releaseDate = media.release_date || media.first_air_date;

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500 border-green-500';
    if (score >= 5) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  const getBadgeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'movie':
        return 'bg-blue-500';
      case 'tv':
        return 'bg-green-500';
      case 'person':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div 
      className="relative rounded-lg overflow-hidden shadow-lg bg-background-light cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {imagePath ? (
        <>
          <Image
            src={`https://image.tmdb.org/t/p/w500${imagePath}`}
            alt={title}
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
                  src="/icons/eye.svg"
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
      <div className="absolute top-2 left-2 z-10">
        <div className={`w-10 h-10 rounded-full border-2 ${getScoreColor(media.vote_average)} flex items-center justify-center bg-background/50`}>
          <span className="text-sm font-bold">{media.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
        <div className="flex justify-between items-center">
          {showMediaType && media.media_type && (
            <span className={`text-xs font-medium py-1 px-2 rounded ${getBadgeColor(media.media_type)}`}>
              {media.media_type}
            </span>
          )}
          {releaseDate && (
            <span className="text-muted-foreground text-sm text-white">
              {new Date(releaseDate).getFullYear()}
            </span>
          )}
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