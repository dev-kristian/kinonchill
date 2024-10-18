// components/NotificationSubscription.tsx

import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUserData } from '@/context/UserDataContext';
import { requestForToken, onMessageListener } from '@/lib/firebaseMessaging';
import NotificationSubscriptionUI from './NotificationSubscriptionUI';
import { Bell, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
const NotificationSubscription = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isIOS166OrHigher, setIsIOS166OrHigher] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();
  const { userData, updateNotificationStatus } = useUserData();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua);

      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

      if (isIOS) {
        const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (match) {
          const version = [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3] || '0', 10)
          ];
          if (version[0] > 16 || (version[0] === 16 && version[1] >= 6)) {
            setIsSupported(true);
            setIsIOS166OrHigher(true);
          } else {
            setIsSupported(false);
          }
        } else {
          setIsSupported(false);
        }
      } else {
        const supported = 'Notification' in window &&
                          'serviceWorker' in navigator &&
                          'PushManager' in window;
        setIsSupported(supported);
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    if (isSupported) {
      const setupMessaging = async () => {
        const unsubscribe = await onMessageListener((payload: any) => {
          console.log('New foreground notification:', payload);
          toast({
            title: payload?.notification?.title || "New Notification",
            description: payload?.notification?.body,
            variant: "default",
          });
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

  const handleUpdateNotificationStatus = async (status: 'allowed' | 'denied' | 'unsupported') => {
    try {
      await updateNotificationStatus(status);
    } catch (error) {
      console.error("Error updating notification status:", error);
      toast({
        title: "Error Updating Status",
        description: "Failed to update notification status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSubscribe = async () => {
    if (!isSupported) {
      toast({
        title: "Notifications Not Supported",
        description: "Push notifications are not available on this device or browser.",
        variant: "destructive",
      });
      await handleUpdateNotificationStatus("unsupported");
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
            await handleUpdateNotificationStatus("allowed");
            toast({
              title: "Notifications Enabled",
              description: "You'll now receive updates from Kino & Cill!",
              variant: "default",
            });
          } catch (error) {
            toast({
              title: "Subscription Error",
              description: "Failed to enable notifications. Please try again later.",
              variant: "destructive",
            });
          }
        }
      } else {
        await handleUpdateNotificationStatus("denied");
        toast({
          title: "Permission Denied",
          description: "Please allow notifications in your browser settings to receive updates.",
          variant: "destructive",
        });
      }
    } else {
      await handleUpdateNotificationStatus("unsupported");
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
    }
  };

  return (
    <NotificationSubscriptionUI
      isSupported={isSupported}
      isIOS166OrHigher={isIOS166OrHigher}
      isStandalone={isStandalone}
      userData={userData}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      handleUpdateNotificationStatus={handleUpdateNotificationStatus}
      handleSubscribe={handleSubscribe}
    />
  );
};

export default NotificationSubscription;