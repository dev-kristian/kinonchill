import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthContext } from '@/context/AuthContext';
import { useState } from 'react';
import { UserData } from '@/types';

export const useNotification = () => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);

  const updateNotificationStatus = async (status: 'allowed' | 'denied' | 'unsupported') => {
    if (!user) throw new Error('User not logged in');
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { notification: status }, { merge: true });
      setUserData(prevData => prevData ? { ...prevData, notification: status } : null);
    } catch (error) {
      console.error('Error updating notification status:', error);
      throw error;
    }
  };

  return { updateNotificationStatus };
};
