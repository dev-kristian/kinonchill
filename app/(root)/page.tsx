//app\(root)\page.tsx
'use client'

import React from 'react';
import TopWatchlistSection from '@/components/home/TopWatchlistSection';
import AnimatedTitle from '@/components/AnimatedTitle';
import PollSection from '@/components/home/PollSection';
import Notification from '@/components/home/Notification';
import { useUserData } from '@/context/UserDataContext';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

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
    <div className="container-6xl px-2 md:px-4 pt-2 pb-8 ">
      <Notification />
      {isLoading ? (
        <p>Loading...</p>
      ) : userData ? (
        <AnimatedTitle>
          Welcome, {userData.username}!
        </AnimatedTitle>
      ) : (
        <AnimatedTitle>
          Welcome to Kino & Cill!
        </AnimatedTitle>
      )}
      <Button onClick={sendNotification} className="mt-4">
        Send Notification to All Users
      </Button>
      <TopWatchlistSection />
      <PollSection />
    </div>
  )
}