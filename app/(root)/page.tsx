// app/(root)/page.tsx
import React from 'react';
import PopularSection from '@/components/PopularSection';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  return (
    <div className="container mx-auto">
      <AnimatedTitle>
        Popular Movies and TV Shows
      </AnimatedTitle>
      <PopularSection />
    </div>
  )
}