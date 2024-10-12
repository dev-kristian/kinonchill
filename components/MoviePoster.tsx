import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  vote_average: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

interface MoviePosterProps {
  movie: Movie;
  showMediaType?: boolean;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ movie, showMediaType = false }) => {
  const { user } = useAuthContext();
  const { userData, isLoading: isUserDataLoading, addToWatchlist, removeFromWatchlist } = useUserData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');

  const mediaType = movie.media_type as 'movie' | 'tv';
  const isInWatchlist = userData?.watchlist[mediaType]?.[movie.id.toString()] || false;

  React.useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleToggleWatchlist = async () => {
    if (!user) {
      setAlertMessage('Please log in to add to your watchlist.');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie.id, mediaType);
        setAlertMessage(`${mediaType === 'movie' ? 'Movie' : 'TV Show'} removed from watchlist.`);
      } else {
        // Create a new object with the required fields, omitting 'last_updated'
        const movieDetails = {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          release_date: movie.release_date || movie.first_air_date,
          vote_average: movie.vote_average,
          // Add any other fields you want to store
        };
        await addToWatchlist(movieDetails, mediaType);
        setAlertMessage(`${mediaType === 'movie' ? 'Movie' : 'TV Show'} added to watchlist successfully!`);
      }
    } catch (error) {
      console.error('Error updating watchlist status:', error);
      setAlertMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setShowAlert(true);
    }
  };

  const title = movie.title || movie.name || 'Untitled';
  const imagePath = movie.poster_path || movie.profile_path;
  const releaseDate = movie.release_date || movie.first_air_date;

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500 border-green-500';
    if (score >= 5) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  const getBadgeColor = () => {
    switch (movie.media_type) {
      case 'movie':
        return 'bg-blue-500';
      case 'tv':
        return 'bg-green-500';
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
        <motion.button
          onClick={handleToggleWatchlist}
          disabled={isLoading || isUserDataLoading}
          className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 ${
            isInWatchlist ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img
            src="/icons/watchlist.svg"
            alt="eye icon"
            width={24}
            height={24}
            style={{ filter: 'invert(100%)' }}
          />
        </motion.button>
      </div>
      <div className="absolute top-2 left-2 z-10">
        <div className={`w-10 h-10 rounded-full border-2 ${getScoreColor(movie.vote_average)} flex items-center justify-center bg-background/50`}>
          <span className="text-sm font-bold">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
        <div className="flex justify-between items-center">
          {showMediaType && movie.media_type && (
            <span className={`text-xs font-medium py-1 px-2 rounded ${getBadgeColor()}`}>
              {movie.media_type}
            </span>
          )}
          {showMediaType && releaseDate && (
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