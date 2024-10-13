import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { Movie } from '@/types/types';
import { BookmarkPlus, BookmarkMinus, Users } from 'lucide-react';

interface MoviePosterProps {
  movie: Movie;
  showMediaType?: boolean;
}
const MoviePoster: React.FC<MoviePosterProps> = ({ movie, showMediaType = false }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { userData, isLoading: isUserDataLoading, addToWatchlist, removeFromWatchlist } = useUserData();
  const [isLoading, setIsLoading] = React.useState(false);

  const mediaType = movie.media_type as 'movie' | 'tv';
  const isInWatchlist = userData?.watchlist[mediaType]?.[movie.id.toString()] || false;

  const handleToggleWatchlist = async () => {
    if (!user) {
      // Handle user not logged in (e.g., show a login prompt)
      return;
    }
  
    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie.id, mediaType);
      } else {
        const movieDetails = {
          id: movie.id,
          title: movie.title || movie.name || 'Unknown Title',
          poster_path: movie.poster_path || null,
          release_date: movie.release_date || movie.first_air_date || '',
          vote_average: movie.vote_average || 0,
          media_type: mediaType,
        };
        await addToWatchlist(movieDetails, mediaType);
      }
    } catch (error) {
      console.error('Error updating watchlist status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = movie.title || movie.name || 'Untitled';
  const imagePath = movie.poster_path || movie.profile_path;
  const releaseDate = movie.release_date || movie.first_air_date;

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return 'text-gray-400';
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleClick = () => {
    router.push(`/details/${movie.media_type}/${movie.id}`);
  };

  return (
    <motion.div 
      className="relative rounded-xl overflow-hidden shadow-lg bg-background-light cursor-pointer"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3]">
        {imagePath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${imagePath}`}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-xl"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-foreground text-lg">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        
        <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
            <span className={`text-sm font-bold ${getScoreColor(movie.vote_average)}`}>
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
          </div>
          {showMediaType && movie.media_type && (
            <span className="text-xs font-medium py-1 px-2 rounded bg-black/50 backdrop-blur-sm text-white">
              {movie.media_type.toUpperCase()}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-lg font-semibold text-white mb-1 truncate">{title}</h2>
          {releaseDate && (
            <span className="text-sm text-gray-300">
              {new Date(releaseDate).getFullYear()}
            </span>
          )}
        </div>
      </div>

      <div className="bg-background-light flex justify-between items-center px-2 py-1">
        {movie.watchlist_count !== undefined && movie.watchlist_count > 0 ? (
          <div className="flex items-center space-x-1">
            <Users className="text-muted-foreground" />
            <span className="text-muted-foreground">{movie.watchlist_count}</span>
          </div>
        ) : (
          <div></div>
        )}
        <motion.button
          onClick={handleToggleWatchlist}
          disabled={isLoading || isUserDataLoading}
          className={`p-2 rounded-full transition-colors duration-200`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isInWatchlist ? (
            <BookmarkMinus className="w-6 h-6 text-primary" />
          ) : (
            <BookmarkPlus className="w-6 h-6 text-muted-foreground" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MoviePoster;