'use client'
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchComponentProps {
  className?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search/${encodeURIComponent(searchQuery)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSearch} className={`${className} w-full`} ref={formRef}>
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Search for movies, TV shows, or people..."
            className="w-full bg-background-light text-foreground placeholder-muted-foreground border-none focus:ring-2 focus:ring-primary rounded-full truncated"
          />
          <Button 
            type="submit" 
            className="absolute right-0 top-1/2 transform -translate-y-1/2  bg-primary/50 hover:bg-primary/70 text-primary-foreground transition-all duration-300 rounded-full px-2 md:px-4"
          >
            <Search className="w-4 h-4" />
            <span className="ml-2 text-sm">Search</span>
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="text-muted-foreground text-sm mt-2 space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {['Inception', 'Breaking Bad', 'Tom Hanks'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-2 py-1 bg-background-light text-muted-foreground hover:bg-primary/70 rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default SearchComponent;