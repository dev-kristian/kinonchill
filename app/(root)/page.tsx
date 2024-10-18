'use client'

import React from 'react';
import AnimatedTitle from '@/components/AnimatedTitle';
import PollSection from '@/components/home/PollSection';
import TopWatchlist from '@/components/home/TopWatchlist';
import { useUserData } from '@/context/UserDataContext';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import NotificationSubscription from '@/components/NotificationSubscription';

export default function Home() {
  const { userData, isLoading } = useUserData();
  const { toast } = useToast();

  const sendNotification = async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Notification',
          body: 'This is a test notification sent to all users!',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Notification Sent",
          description: "The notification was sent successfully to all users.",
        });
      } else {
        throw new Error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container-6xl mx-auto px-4 py-4">
      <div className="flex flex-col lg:flex-row lg:space-x-4">
        <div className="w-full lg:w-3/4">
        {isLoading ? (
          <p>Loading...</p>
        ) : userData ? (
          <AnimatedTitle>
            {(className) => (
              <>
                <span className={className}>Welcome, </span>
                <span className="text-primary/50">{userData.username}</span>
                <span className={className}>!</span>
              </>
            )}
          </AnimatedTitle>
        ) : (
          <AnimatedTitle>
            {(className) => (
              <span className={className}>Welcome to Kino & Cill!</span>
            )}
          </AnimatedTitle>
        )}

          {userData && userData.notification !== "unsupported" && (
            <NotificationSubscription />
          )}

          <Button onClick={sendNotification} className="mb-2">
            Send Notification to All Users
          </Button>

          <PollSection />
        </div>
        
        <div className="w-full lg:w-1/4">
          <TopWatchlist />
        </div>
      </div>
    </div>
  );
}