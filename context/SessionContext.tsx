import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import { useUserData } from './UserDataContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc,
  query, 
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getDoc, 
  getDocs,
  deleteField
} from 'firebase/firestore';
import { DateTimeSelection } from '@/types/types';
import { Session } from '@/types/types';

interface SessionContextType {
  createSession: (dates: DateTimeSelection[]) => Promise<Session>;
  createPoll: (sessionId: string, movieTitles: string[]) => Promise<void>;
  updateUserDates: (sessionId: string, dates: DateTimeSelection[]) => Promise<void>;
  toggleVote: (sessionId: string, movieTitle: string) => Promise<void>;
  addMovieToPoll: (sessionId: string, movieTitle: string) => Promise<void>;
  removeMovieFromPoll: (sessionId: string, movieTitle: string) => Promise<void>;
  fetchAllSessions: () => Promise<Session[]>;
  sessions: Session[];
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const { userData } = useUserData();
  const [sessions, setSessions] = useState<Session[]>([]);

  const createSession = useCallback(async (dates: DateTimeSelection[]): Promise<Session> => {
    if (!user || !userData) throw new Error('User must be logged in to create a session');
    try {
      const sessionsRef = collection(db, 'sessions');
      const newSessionRef = doc(sessionsRef);
      const userDates = {
        [userData.username]: dates.map(({ date, hours }) => ({
          date: Timestamp.fromDate(date),
          hours: hours === 'all' ? 'all' : hours.map(h => Timestamp.fromDate(new Date(date.setHours(h))))
        }))
      };
  
      await setDoc(newSessionRef, {
        createdAt: serverTimestamp(),
        createdBy: userData.username,
        userDates: userDates,
        status: 'active'
      });
  
      const newSession: Session = {
        id: newSessionRef.id,
        createdAt: new Date(),
        createdBy: userData.username,
        userDates: {
          [userData.username]: dates.map(({ date, hours }) => ({
            date: date.toISOString(),
            hours: hours === 'all' ? 'all' : hours.map(h => new Date(date.setHours(h)).toISOString())
          }))
        },
        status: 'active'
      };
  
      setSessions(prev => [newSession, ...prev]);
  
      return newSession;
    } catch (error) {
      console.error("Error creating session: ", error);
      throw error;
    }
  }, [user, userData]);

  const fetchAllSessions = useCallback(async (): Promise<Session[]> => {
    if (!user || !userData) throw new Error('User must be logged in to fetch sessions');
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const sessionsList: Session[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          createdBy: data.createdBy,
          userDates: Object.fromEntries(
            Object.entries(data.userDates).map(([username, dates]) => [
              username,
              (dates as { date: Timestamp; hours: Timestamp[] | 'all' }[]).map(({ date, hours }) => ({
                date: date.toDate().toISOString(),
                hours: hours === 'all' ? 'all' : (hours as Timestamp[]).map(ts => ts.toDate().toISOString())
              }))
            ])
          ),
          poll: data.poll ? {
            id: data.poll.id,
            movieTitles: data.poll.movieTitles,
            votes: data.poll.votes
          } : undefined,
          status: data.status
        };
      });
  
      setSessions(sessionsList);
      return sessionsList;
    } catch (error) {
      console.error("Error fetching sessions: ", error);
      throw error;
    }
  }, [user, userData]);

  const updateUserDates = useCallback(async (sessionId: string, dates: DateTimeSelection[]) => {
    if (!user || !userData) throw new Error('User must be logged in to update dates');
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        [`userDates.${userData.username}`]: dates.map(({ date, hours }) => ({
          date: Timestamp.fromDate(date),
          hours: hours === 'all' ? 'all' : hours.map(h => Timestamp.fromDate(new Date(date.setHours(h))))
        }))
      });
      
      await fetchAllSessions();
    } catch (error) {
      console.error("Error updating user dates: ", error);
      throw error;
    }
  }, [user, userData, fetchAllSessions]);

  const createPoll = useCallback(async (sessionId: string, movieTitles: string[]) => {
    if (!user || !userData) throw new Error('User must be logged in to create a poll');
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const pollId = Math.random().toString(36).substr(2, 9);
      const pollData = {
        id: pollId,
        movieTitles,
        votes: {}
      };
  
      await updateDoc(sessionRef, {
        poll: pollData
      });
  
      await fetchAllSessions();
    } catch (error) {
      console.error("Error creating poll: ", error);
      throw error;
    }
  }, [user, userData, fetchAllSessions]);

  const addMovieToPoll = useCallback(async (sessionId: string, movieTitle: string) => {
    if (!user || !userData) throw new Error('User must be logged in to add a movie');
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnapshot = await getDoc(sessionRef);
      const sessionData = sessionSnapshot.data() as Session;
  
      if (!sessionData.poll) throw new Error('No poll exists for this session');
  
      const updatedMovieTitles = [...sessionData.poll.movieTitles, movieTitle];
  
      await updateDoc(sessionRef, {
        'poll.movieTitles': updatedMovieTitles
      });
  
      await fetchAllSessions();
    } catch (error) {
      console.error("Error adding movie to poll: ", error);
      throw error;
    }
  }, [user, userData, fetchAllSessions]);

  const removeMovieFromPoll = useCallback(async (sessionId: string, movieTitle: string) => {
    if (!user || !userData) throw new Error('User must be logged in to remove a movie');
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnapshot = await getDoc(sessionRef);
      const sessionData = sessionSnapshot.data() as Session;
  
      if (!sessionData.poll) throw new Error('No poll exists for this session');
  
      const updatedMovieTitles = sessionData.poll.movieTitles.filter(title => title !== movieTitle);
  
      await updateDoc(sessionRef, {
        'poll.movieTitles': updatedMovieTitles,
        [`poll.votes.${movieTitle}`]: deleteField()
      });
  
      await fetchAllSessions();
    } catch (error) {
      console.error("Error removing movie from poll: ", error);
      throw error;
    }
  }, [user, userData, fetchAllSessions]);

  const toggleVote = useCallback(async (sessionId: string, movieTitle: string) => {
    if (!user || !userData) throw new Error('User must be logged in to vote');
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnapshot = await getDoc(sessionRef);
      const sessionData = sessionSnapshot.data() as Session;

      if (!sessionData.poll) throw new Error('No poll exists for this session');

      const userVotes = sessionData.poll.votes[userData.username] || [];
      const updatedVotes = userVotes.includes(movieTitle)
        ? userVotes.filter(vote => vote !== movieTitle)
        : [...userVotes, movieTitle];

      await updateDoc(sessionRef, {
        [`poll.votes.${userData.username}`]: updatedVotes
      });

      await fetchAllSessions();
    } catch (error) {
      console.error("Error toggling vote for movie: ", error);
      throw error;
    }
  }, [user, userData, fetchAllSessions]);

  useEffect(() => {
    if (user && userData) {
      fetchAllSessions();
    }
  }, [user, userData, fetchAllSessions]);

  const contextValue = useMemo(() => ({
    createSession,
    createPoll,
    updateUserDates,
    toggleVote,
    addMovieToPoll,
    removeMovieFromPoll,
    fetchAllSessions,
    sessions
  }), [
    createSession,
    createPoll,
    updateUserDates,
    toggleVote,
    addMovieToPoll,
    removeMovieFromPoll,
    fetchAllSessions,
    sessions
  ]);
  
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};