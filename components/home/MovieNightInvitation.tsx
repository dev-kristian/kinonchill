import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { useUserData } from '@/context/UserDataContext';
import { useSession } from '@/context/SessionContext';
import { useSendInvitation } from '@/hooks/useSendInvitation';
import MovieNightCalendar from './MovieNightCalendar';
import { DateTimeSelection } from '@/types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiFilm, FiSend, FiX } from 'react-icons/fi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTopWatchlist } from '@/context/TopWatchlistContext';
import { TopWatchlistItem } from '@/types/types';
import Image from 'next/image';

export default function MovieNightInvitation() {
  const { toast } = useToast();
  const { userData, isLoading: userLoading } = useUserData();
  const { createSession, createPoll, latestSession, fetchLatestSession, setLatestSession } = useSession();
  const { sendInvitation, error: invitationError } = useSendInvitation();
  const [selectedDates, setSelectedDates] = useState<DateTimeSelection[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [movieTitles, setMovieTitles] = useState<TopWatchlistItem[]>([]);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const { topWatchlistItems } = useTopWatchlist();
  const [suggestions, setSuggestions] = useState<TopWatchlistItem[]>([]);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLatestSession();
  }, [fetchLatestSession]);

  const handleCreateSession = () => {
    setShowCalendar(true);
  };

  const handleDatesSelected = (dates: DateTimeSelection[]) => {
    setSelectedDates(dates);
  };

  const handleAddMovieTitle = () => {
    if (newMovieTitle.trim() !== '') {
      const newMovie: TopWatchlistItem = {
        id: Date.now(), // Use a temporary ID
        title: newMovieTitle.trim(),
        poster_path: '',
        vote_average: 0,
        media_type: 'movie',
        watchlist_count: 0,
        weighted_score: 0
      };
      setMovieTitles([...movieTitles, newMovie]);
      setNewMovieTitle('');
    }
  };

  const removeMovieTitle = (index: number) => {
    setMovieTitles(movieTitles.filter((_, i) => i !== index));
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMovieTitle(value);
  
    if (value.length > 1) {
      const movieSuggestions = topWatchlistItems.movie
        .filter(item => item.title?.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
  
      setSuggestions(movieSuggestions);
    } else {
      setSuggestions([]);
    }
  };
  const handleSuggestionClick = (movie: TopWatchlistItem) => {
    setNewMovieTitle('');
    setMovieTitles([...movieTitles, movie]);
    setSuggestions([]);
  };
  
  const completeSession = async () => {
    if (userLoading || !userData) {
      toast({
        title: "Error",
        description: "User data not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    try {
      const newSession = await createSession(selectedDates);
  
      if (movieTitles.length > 0 && newSession) {
        await createPoll(newSession.id, movieTitles.map(movie => movie.title || ''));
      }
  
      if (sendNotification) {
        await sendInvitation();
        if (invitationError) {
          throw new Error(invitationError);
        }
      }
  
      // Set the latest session directly
      setLatestSession(newSession);
  
      // Fetch the updated session data after creating the poll
      await fetchLatestSession();
  
      toast({
        title: "Session Created",
        description: "Your movie night session has been created successfully!",
      });
  
      setShowCalendar(false);
      setSelectedDates([]);
      setSendNotification(true);
      setMovieTitles([]);
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Error",
        description: "Failed to complete the session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderSessionCreation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="bg-transparent p-2 md:p-4 rounded-lg flex flex-col lg:flex-row lg:space-x-4">
        <div className="lg:w-2/3 mb-4 lg:mb-0">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Select Date(s) (Optional)
          </h3>
          <MovieNightCalendar 
            selectedDates={selectedDates} 
            onDatesSelected={handleDatesSelected}
          />
        </div>
        
        <div className="lg:w-1/3">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FiFilm className="mr-2" /> Create Movie Poll (Optional)
      </h3>
          <div ref={inputContainerRef} className="flex flex-row space-y-2 mb-4 relative items-center">
            <Input 
              value={newMovieTitle} 
              onChange={handleInputChange}
              placeholder="Enter movie title"
              className="flex-grow"
            />
{suggestions.length > 0 && (
  <ul className="absolute z-10 bg-gray-800 w-full mt-1 rounded-md shadow-lg top-full">
    {suggestions.map((movie) => (
      <li 
        key={movie.id} 
        className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center"
        onClick={() => handleSuggestionClick(movie)}
      >
        <Image 
          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
          alt={movie.title || ''}
          width={32}
          height={48}
          className="object-cover mr-2"
        />
        <span>{movie.title}</span>
      </li>
    ))}
  </ul>
)}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleAddMovieTitle} className="bg-transparent hover:bg-transparent text-primary/70 md:text-white hover:text-primary/50 shadow-none">
                    Add Movie
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='bg-primary/50'>
                  <p>Add movie to the poll</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <AnimatePresence>
          {movieTitles.length > 0 && (
  <motion.ul
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-1 gap-2 mt-4"
  >
    {movieTitles.map((movie, index) => (
      <motion.li
        key={movie.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex items-center justify-between bg-gray-900 p-2 rounded-xl"
      >
        <div className="flex items-center">
          <Image 
            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
            alt={movie.title || ''}
            width={32}
            height={48}
            className="object-cover mr-2"
          />
          <span className="text-gray-300 truncate">{movie.title}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeMovieTitle(index)}
          className="text-gray-400 hover:text-white"
        >
          <FiX />
        </Button>
      </motion.li>
    ))}
  </motion.ul>
)}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-transparent p-2 md:p-4 ">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sendNotification"
            checked={sendNotification}
            onCheckedChange={(checked) => setSendNotification(checked as boolean)}
          />
          <label htmlFor="sendNotification" className="text-sm font-medium">
            Send notification to all users
          </label>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={completeSession} 
              className="w-full py-6 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hover:bg-gradient-to-r hover:from-purple-300 hover:to-pink-500 shadow-none transition-all duration-300"
            >
              <FiSend className="mr-2 text-primary/50" /> Start Session
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create the movie night session</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-950 to-gray-900 p-1 rounded-lg shadow-xl mx-auto">
      {!latestSession && !showCalendar ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <p className="text-xl mb-4 text-gray-300">There are no active movie night sessions at the moment.</p>
          <p className="mb-6 text-gray-400">Would you like to start a new movie night? Create a session and invite your friends!</p>
          <Button 
            onClick={handleCreateSession} 
            className="py-6 px-8 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 shadow-none transition-all duration-300"
          >
            <FiCalendar className="mr-2 text-primary/50" /> Start a New Movie Night
          </Button>
        </motion.div>
      ) : latestSession && !showCalendar ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <p className="mb-6 text-xl text-gray-300">There&apos;s already an active movie night session. Would you like to create a new one?</p>
          <Button 
            onClick={handleCreateSession} 
            className="py-6 px-8 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <FiCalendar className="mr-2" /> Create New Movie Night Session
          </Button>
        </motion.div>
      ) : (
        renderSessionCreation()
      )}
    </div>
  );
}