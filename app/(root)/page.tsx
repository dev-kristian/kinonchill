"use client"

// pages/index.tsx

import React from 'react';
import AnimatedTitle from '@/components/AnimatedTitle';
import TopWatchlist from '@/components/home/TopWatchlist';
import { useUserData } from '@/context/UserDataContext';
import NotificationSubscription from '@/components/home/NotificationSubscription';
import MovieNightInvitation from '@/components/home/MovieNightInvitation';

export default function Home() {
  const { userData, isLoading } = useUserData();

  return (
    <div className="container-6xl mx-auto px-2 md:px-4 py-4">
      <div className="mb-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : userData ? (
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

      <div className="flex flex-col lg:flex-row lg:space-x-4 gap-4">
        <div className="w-full lg:w-3/4 space-y-4">
          <MovieNightInvitation />
        </div>
        
        <div className="w-full lg:w-1/4">
          <TopWatchlist />
        </div>
      </div>
    </div>
  );
}