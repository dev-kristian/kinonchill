//app\(root)\page.tsx
"use client"

import React from 'react';
import AnimatedTitle from '@/components/AnimatedTitle';
import TopWatchlist from '@/components/home/TopWatchlist';
import { useUserData } from '@/context/UserDataContext';
import NotificationSubscription from '@/components/home/NotificationSubscription';
import MovieNightInvitation from '@/components/home/MovieNightInvitation';
import UserWatchlist from '@/components/home/UserWatchList';

export default function Home() {
  const { userData } = useUserData();

  return (
    <div className="container-6xl mx-auto px-2 md:px-4 py-4">
      <div className="mb-6">
        {userData ? (
          <AnimatedTitle>
            {(className) => (
              <>
                <span className={className}>Welcome, </span>
                <span className="text-primary/50">{userData.username}</span>
                <span className={className}>&nbsp;!</span>
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
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-2">
        <div className="w-full lg:w-3/4 space-y-4">
          <MovieNightInvitation />
          <UserWatchlist />
        </div>
        
        <div className="w-full lg:w-1/4">
          <TopWatchlist />
        </div>
      </div>
    </div>
  );
}