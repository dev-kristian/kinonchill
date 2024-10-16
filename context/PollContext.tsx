// context/PollContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, onSnapshot, deleteDoc, increment, query, orderBy } from 'firebase/firestore';
import { useAuthContext } from './AuthContext';
import { usePopular } from './PopularContext';
import { useView } from './ViewContext';
// Import or define the PopularItem type
import { PopularItem } from './PopularContext'; // Adjust the import path as needed

export interface Poll {
    id: string;
    question: string;
    options: string[];
    votes: { [key: string]: number };
    createdBy: string;
    createdAt: Timestamp;
    userVotes: { [username: string]: number[] }; // Changed from userId to username
  }

  interface PollContextType {
    polls: Poll[];
    allPolls: Poll[];
    loadMorePolls: () => void;
    createPoll: (options: string[]) => Promise<void>;
    votePoll: (pollId: string, optionIndex: number, username: string) => Promise<void>;
    deletePoll: (pollId: string) => Promise<void>;
    updatePoll: (pollId: string, newOptions: string[]) => Promise<void>;
    popularItems: PopularItem[];
  }

const PollContext = createContext<PollContextType | undefined>(undefined);

export const usePoll = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [allPolls, setAllPolls] = useState<Poll[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const { initialPollsCount } = useView();
  const { user } = useAuthContext();
  const { popularItems: popularItemsObj } = usePopular();

  // Convert the popularItems object to an array
  const popularItems = [...popularItemsObj.movie, ...popularItemsObj.tv];

  useEffect(() => {
    const pollsRef = collection(db, 'polls');
    const pollsQuery = query(pollsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(pollsQuery, (snapshot) => {
      const pollsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));
      setAllPolls(pollsData);
      setPolls(pollsData.slice(0, initialPollsCount));
    });

    return () => unsubscribe();
  }, [initialPollsCount]);

  const loadMorePolls = () => {
    setPolls(allPolls);
  };

  const createPoll = async (options: string[]) => {
    if (!user) return;

    const newPoll = {
      question: "Vote for the movie to watch!",
      options,
      votes: options.reduce((acc, _, index) => ({ ...acc, [index]: 0 }), {}),
      createdBy: user.uid,
      createdAt: new Date(),
    };

    await addDoc(collection(db, 'polls'), newPoll);
  };

  const updatePoll = async (pollId: string, newOptions: string[]) => {
    if (!user) return;
  
    const pollRef = doc(db, 'polls', pollId);
    await updateDoc(pollRef, {
      options: newOptions,
      votes: newOptions.reduce((acc, _, index) => ({ ...acc, [index]: 0 }), {}),
      userVotes: {}
    });
  };

  const deletePoll = async (pollId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'polls', pollId));
      console.log(`Poll ${pollId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting poll:', error);
    }
  };

  const votePoll = async (pollId: string, optionIndex: number, username: string) => {
    if (!user) return;

    const pollRef = doc(db, 'polls', pollId);
    const currentPoll = polls.find(p => p.id === pollId);
    
    if (currentPoll) {
      const userVotes = currentPoll.userVotes?.[username] || [];
      
      if (userVotes.includes(optionIndex)) {
        // Retract vote
        await updateDoc(pollRef, {
          [`votes.${optionIndex}`]: increment(-1),
          [`userVotes.${username}`]: userVotes.filter(v => v !== optionIndex)
        });
      } else {
        // Add vote
        await updateDoc(pollRef, {
          [`votes.${optionIndex}`]: increment(1),
          [`userVotes.${username}`]: [...userVotes, optionIndex]
        });
      }
    } else {
      console.error(`Poll with id ${pollId} not found`);
    }
  };

  return (
    <PollContext.Provider value={{ polls, allPolls, loadMorePolls, createPoll, votePoll, deletePoll, updatePoll, popularItems }}>
      {children}
    </PollContext.Provider>
  );
};