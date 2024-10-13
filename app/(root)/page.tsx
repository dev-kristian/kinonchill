// app/(root)/page.tsx
import React from 'react';
import PopularItems from '@/components/PopularItems';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function Home() {
  return (
    <div className="container mx-auto">
      <AnimatedTitle>
        Popular Movies and TV Shows
      </AnimatedTitle>
      <PopularItems />
    </div>
  )
}