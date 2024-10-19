import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { useUserData } from './UserDataContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc,
  setDoc,
  updateDoc,
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore'; 

interface Session {
  id: string;
  createdAt: Date;
  createdBy: string;
  userDates: {
    [username: string]: string[]; 
  };
} 

interface SessionContextType {
  currentSession: Session | null;
  allSessions: Session[];
  createSession: (dates: Date[]) => Promise<void>;
  updateSessionDates: (dates: Date[]) => Promise<void>;
  loadUserSessions: () => Promise<void>;
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

  const createSession = async (dates: Date[]) => {
    if (!user || !userData) throw new Error('User must be logged in to create a session'); 
try {
  const sessionsRef = collection(db, 'sessions');
  const newSessionRef = doc(sessionsRef);
  const userDates = {
    [userData.username]: dates.map(date => date.toISOString())
  };

  await setDoc(newSessionRef, {
    createdAt: serverTimestamp(),
    createdBy: userData.username,
    userDates: userDates
  });

  const newSession: Session = {
    id: newSessionRef.id,
    createdAt: new Date(),
    createdBy: userData.username,
    userDates: userDates
  };

  setCurrentSession(newSession);
  setAllSessions(prev => [...prev, newSession]);
} catch (error) {
  console.error("Error creating session: ", error);
  throw error;
}

  }; 

  const updateSessionDates = async (dates: Date[]) => {
    if (!currentSession || !userData) throw new Error('No active session or user data to update'); 
try {
  const sessionRef = doc(db, 'sessions', currentSession.id);
  await updateDoc(sessionRef, {
    [`userDates.${userData.username}`]: dates.map(date => date.toISOString())
  });

  setCurrentSession(prev => prev ? {
    ...prev,
    userDates: {
      ...prev.userDates,
      [userData.username]: dates.map(date => date.toISOString())
    }
  } : null);
} catch (error) {
  console.error("Error updating session dates: ", error);
  throw error;
}

  }; 

  const loadUserSessions = async () => {
    if (!user || !userData) return; 
try {
  const sessionsRef = collection(db, 'sessions');
  const q = query(sessionsRef, where("createdBy", "==", userData.username));
  const querySnapshot = await getDocs(q);

  const sessions: Session[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as DocumentData;
    sessions.push({
      id: doc.id,
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
      userDates: data.userDates
    });
  });

  setAllSessions(sessions);
} catch (error) {
  console.error("Error loading user sessions: ", error);
  throw error;
}

  }; 

  useEffect(() => {
    if (user && userData) {
      loadUserSessions();
    } else {
      setCurrentSession(null);
      setAllSessions([]);
    }
  }, [user, userData]); 

  return (
    <SessionContext.Provider value={{ currentSession, allSessions, createSession, updateSessionDates, loadUserSessions }}>
      {children}
    </SessionContext.Provider>
  );
}; 