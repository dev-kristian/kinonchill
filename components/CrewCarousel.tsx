'use client';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CrewPoster from './CrewPoster';
import Spinner from './Spinner';
import { CrewMember } from '@/types/types'; // Update the import path as necessary

interface CrewCarouselProps {
  crewMembers: CrewMember[];
  isLoading: boolean;
  error: string | null;
}

const CrewCarousel: React.FC<CrewCarouselProps> = ({ crewMembers, isLoading, error }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - containerRef.current!.offsetLeft);
    setScrollLeft(containerRef.current!.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const x = pageX - containerRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current!.scrollLeft = scrollLeft - walk;
  };

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="mb-8 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">Cast &amp; Crew</h2>
      <div
        className="overflow-x-auto py-6 cursor-grab active:cursor-grabbing scroll-container w-full"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleMouseMove}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
          MozUserSelect: 'none',
        }}
      >
        <motion.div className="flex space-x-4 flex-nowrap">
          {crewMembers.map((crewMember) => (
            <div key={crewMember.id} className="flex-none w-40 sm:w-48 lg:w-56">
              <CrewPoster crewMember={crewMember} />
            </div>
          ))}
          {isLoading && (
            <div className="flex-none w-40 sm:w-48 lg:w-56 flex justify-center items-center">
              <Spinner size="lg" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CrewCarousel;