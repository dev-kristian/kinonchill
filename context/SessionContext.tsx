import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import { useUserData } from './UserDataContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc,
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  updateDoc,
  getDocs, 
  serverTimestamp,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { DateTimeSelection } from '@/types/types'; 

interface Poll {
  id: string;
  movieTitles: string[];
  votes: { [username: string]: string };
}

interface Session {
  id: string;
  createdAt: Date;
  createdBy: string;
  userDates: {
    [username: string]: {
      date: string;
      hours: string[] | 'all';
    }[];
  };
  poll?: Poll;
  status: 'active' | 'inactive'; // Add this line
}

interface SessionContextType {
  currentSession: Session | null;
  allSessions: Session[];
  createSession: (dates: DateTimeSelection[]) => Promise<Session>; 
  createPoll: (sessionId: string, movieTitles: string[]) => Promise<void>;
  latestSession: Session | null;
  fetchLatestSession: () => Promise<void>;
  updateUserDates: (sessionId: string, dates: DateTimeSelection[]) => Promise<void>;
  setLatestSession: React.Dispatch<React.SetStateAction<Session | null>>;
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
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [latestSession, setLatestSession] = useState<Session | null>(null);

  const createSession = async (dates: DateTimeSelection[]): Promise<Session> => {
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
  
      setCurrentSession(newSession);
      setAllSessions(prev => [...prev, newSession]);
      setLatestSession(newSession); // Add this line to set the latest session
  
      return newSession;
    } catch (error) {
      console.error("Error creating session: ", error);
      throw error;
    }
  };

  const updateUserDates = async (sessionId: string, dates: DateTimeSelection[]) => {
    if (!user || !userData) throw new Error('User must be logged in to update dates');
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        [`userDates.${userData.username}`]: dates.map(({ date, hours }) => ({
          date: Timestamp.fromDate(date),
          hours: hours === 'all' ? 'all' : hours.map(h => Timestamp.fromDate(new Date(date.setHours(h))))
        }))
      });

      setLatestSession(prev => prev && prev.id === sessionId ? {
        ...prev,
        userDates: {
          ...prev.userDates,
          [userData.username]: dates.map(({ date, hours }) => ({
            date: date.toISOString(),
            hours: hours === 'all' ? 'all' : hours.map(h => new Date(date.setHours(h)).toISOString())
          }))
        }
      } : prev);
    } catch (error) {
      console.error("Error updating user dates: ", error);
      throw error;
    }
  };

  const createPoll = async (sessionId: string, movieTitles: string[]) => {
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
  
      // Update the context
      setLatestSession(prevSession => {
        if (prevSession && prevSession.id === sessionId) {
          return {
            ...prevSession,
            poll: pollData
          };
        }
        return prevSession;
      });
  
      setCurrentSession(prevSession => {
        if (prevSession && prevSession.id === sessionId) {
          return {
            ...prevSession,
            poll: pollData
          };
        }
        return prevSession;
      });
  
    } catch (error) {
      console.error("Error creating poll: ", error);
      throw error;
    }
  };

  const fetchLatestSession = useCallback(async () => {
    if (!user || !userData) return;
    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as DocumentData;
        const session: Session = {
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
        setLatestSession(session);
      } else {
        setLatestSession(null);
      }
    } catch (error) {
      console.error("Error fetching latest active session: ", error);
    }
  }, [user, userData]);

  useEffect(() => {
    if (user && userData) {
      fetchLatestSession();
    } else {
      setLatestSession(null);
    }
  }, [user, userData, fetchLatestSession]);

  return (
    <SessionContext.Provider value={{ 
      currentSession, 
      allSessions, 
      createSession, 
      createPoll,
      latestSession,
      fetchLatestSession,
      updateUserDates,
      setLatestSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};