// components/home/LatestSession.tsx

import React, { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { useUserData } from '@/context/UserDataContext';
import { format, differenceInDays } from 'date-fns';
import MovieNightCalendar from './MovieNightCalendar';
import { DatePopularity, DateTimeSelection } from '@/types/types'; 
import { calculateDatePopularity } from '@/utils/datePopularityCalculator';
import { Users, Film, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LatestSession: React.FC = () => {
  const { latestSession, updateUserDates } = useSession();
  const { userData } = useUserData();
  const [selectedDates, setSelectedDates] = useState<DateTimeSelection[]>([]);
  const [datePopularity, setDatePopularity] = useState<DatePopularity[]>([]);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (latestSession) {
      setDatePopularity(calculateDatePopularity(latestSession.userDates));
    }
  }, [latestSession]);

  useEffect(() => {
    if (latestSession && userData) {
      const userDates = latestSession.userDates[userData.username] || [];
      setSelectedDates(userDates.map(date => ({
        date: new Date(date.date),
        hours: date.hours === 'all' ? 'all' : date.hours.map(h => new Date(h).getHours())
      })));
    }
  }, [latestSession, userData]);

  if (!latestSession || !userData) {
    return null;
  }

  const handleDatesSelected = async (dates: DateTimeSelection[]) => {
    setSelectedDates(dates);
    if (latestSession && userData) {
      try {
        await updateUserDates(latestSession.id, dates);
      } catch (error) {
        console.error('Error updating dates:', error);
      }
    }
  };

  const daysAgo = differenceInDays(new Date(), new Date(latestSession.createdAt));

  return (
    <div className="bg-gray-950 p-2 md:p-4 rounded-lg shadow-lg text-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white">Movie Night Planner</h2>
        <motion.button
          className="text-gray-600 hover:text-pink-600"
          onClick={() => setShowInfo(!showInfo)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Info size={24} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 p-4 rounded-lg text-gray-400"
          >
            <p className="text-sm mb-2">
              <span className="font-semibold ">Created by:&nbsp;</span> 
              <span className='text-pink-500'>{latestSession.createdBy}</span>
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">Created:&nbsp;</span> 
              <span className='text-pink-500'>{format(latestSession.createdAt, 'PPP')} ({daysAgo} day{daysAgo !== 1 ? 's' : ''} ago)</span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">How to use:</span> Click on dates to select when you&apos;re available. The most popular dates will appear on the right or below if you are on mobile.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-grow">
          <MovieNightCalendar 
            selectedDates={selectedDates} 
            onDatesSelected={handleDatesSelected}
            datePopularity={datePopularity}
            activeUsername={userData.username}
            userDates={latestSession.userDates}
          />
        </div>
        <div className="lg:w-64">
          <h3 className="text-lg font-semibold my-2 text-white flex items-center">
            <Users className="mr-2 text-primary/70" /> Top Dates
          </h3>
          {datePopularity.slice(0, 3).map((date, index) => (
            <div key={index} className="mb-2 last:mb-0 bg-gray-900/50 p-2 rounded-2xl">
              <p className="text-white font-semibold">{format(new Date(date.date), 'MMM d, yyyy')}</p>
              <p className="text-xs text-gray-600">{date.count} people available</p>
              <p className="text-xs text-gray-500 truncate" title={date.users.join(', ')}>
                Including: <span className='text-pink-500'>{date.users.join(', ')}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {latestSession.poll && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
            <Film className="mr-2 text-primary/70" /> Movie Suggestions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {latestSession.poll.movieTitles.map((title, index) => (
              <div key={index} className="bg-gray-900 p-2 rounded text-white">
                {title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestSession;