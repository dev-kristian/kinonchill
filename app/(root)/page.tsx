// app/(root)/page.tsx
import React from 'react';
import PopularSection from '@/components/PopularSection';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  return (
    <div className="container-6xl mx-2 md:mx-6 mt-4">
      <AnimatedTitle>
        Popular Movies and TV Shows
      </AnimatedTitle>
      <PopularSection />
    </div>
  )
}