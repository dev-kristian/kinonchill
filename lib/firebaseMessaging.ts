// lib/firebaseMessaging.ts
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingInstance } from "./firebase";

export const requestForToken = async () => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.log('Firebase messaging is not supported in this browser');
    return null;
  }

  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
    });
    if (currentToken) {
      console.log('Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = async (callback: (payload: any) => void) => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.log('Firebase messaging is not supported in this browser');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log("Received foreground message", payload);
    callback(payload);
  });
};