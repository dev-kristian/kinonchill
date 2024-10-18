// components/Notification.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { requestForToken, onMessageListener } from '../../lib/firebaseMessaging';
import { useToast } from "@/hooks/use-toast"
import { Button } from '@/components/ui/button';
import AddToHomeScreen from '../AddToHomeScreen';

const Notification = () => {
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
    };
    checkSupport();
  }, []);

  useEffect(() => {
    if (isSupported) {
      const setupMessaging = async () => {
        const unsubscribe = await onMessageListener((payload: any) => {
          console.log('New foreground notification:', payload);
          // Show the notification using toast for foreground messages
          toast({
            title: payload?.notification?.title || "New Notification",
            description: payload?.notification?.body,
          })
        });

        return () => {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      };

      setupMessaging();
    }
  }, [isSupported, toast]);

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this device or browser.",
        variant: "destructive",
      });
      return;
    }

    if ('Notification' in window) {
      let permission = await window.Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted. Requesting for token.");
        const token = await requestForToken();
        if (token) {
          try {
            await fetch('/api/subscribe-to-topic', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token }),
            });
            console.log('Subscribed to "all" topic');
            setIsSubscribed(true);
            toast({
              title: "Subscribed to Notifications",
              description: "You will now receive push notifications.",
            });
          } catch (error) {
            console.error('Error subscribing to topic:', error);
            toast({
              title: "Subscription Error",
              description: "Failed to subscribe to notifications. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else {
        console.log("Notification permission denied");
        toast({
          title: "Permission Denied",
          description: "You need to allow notifications to receive updates.",
          variant: "destructive",
        });
      }
    } else {
      console.log("Notifications not supported in this browser");
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <AddToHomeScreen />
      {!isSubscribed && isSupported && (
        <Button onClick={handleSubscribe}>
          Subscribe to Notifications
        </Button>
      )}
      {!isSupported && (
        <p>Push notifications are not supported on this device or browser.</p>
      )}
    </div>
  );
};

export default Notification;