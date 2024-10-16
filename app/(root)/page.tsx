// app/(root)/page.tsx
'use client'

import React from 'react';
import PopularSection from '@/components/PopularSection';
import AnimatedTitle from '@/components/AnimatedTitle';
import PollSection from '@/components/PollSection';
import { useUserData } from '@/context/UserDataContext';

export default function Home() {
  const { userData, isLoading } = useUserData();

  return (
    <div className="container-6xl mx-2 md:mx-4 mt-2">
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
      <PollSection />
      <PopularSection />
    </div>
  )
}