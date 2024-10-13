'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TrendingSection from '@/components/TrendingSection';
import { useRouter } from 'next/navigation';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/search/${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="container mx-auto ">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Explore Movies and TV Shows
      </motion.h1>

      <h2 className="text-2xl font-bold mb-4">Search</h2>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies or TV shows..."
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      <TrendingSection />

    </div>
  );
}