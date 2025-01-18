// components/FlickyEmbed.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVER_OPTIONS = [
  { 
    name: 'Nexa', 
    url: 'https://v1.shaaringaton.host/nexa/',
    description: 'High-speed, reliable streaming',
    quality: 'HD'
  },
  { 
    name: 'Multi', 
    url: 'https://v2.shaaringaton.host/multi/',
    description: 'Multiple source options',
    quality: 'Full HD'
  },
  { 
    name: 'Shukra', 
    url: 'https://v3.shaaringaton.host/shukra/',
    description: 'Alternative streaming source',
    quality: 'HD'
  },
  { 
    name: 'Desi', 
    url: 'https://v4.shaaringaton.host/desi/',
    description: 'Regional content optimized',
    quality: 'SD/HD'
  },
  { 
    name: 'VietFlick', 
    url: 'https://v5.shaaringaton.host/vietflick/',
    description: 'International streaming',
    quality: 'Full HD'
  },
  { 
    name: 'Budh', 
    url: 'https://v6.shaaringaton.host/budh/',
    description: 'Backup streaming server',
    quality: 'HD'
  },
  { 
    name: 'OYO', 
    url: 'https://v7.shaaringaton.host/oyo/',
    description: 'Alternative backup server',
    quality: 'SD'
  }
];

interface FlickyEmbedProps {
  tmdbId: number;
  seasonNumber?: number;
  episodeNumber?: number;
  onClose: () => void;
}

const FlickyEmbed: React.FC<FlickyEmbedProps> = ({ 
  tmdbId, 
  seasonNumber, 
  episodeNumber, 
  onClose 
}) => {
  const [selectedServer, setSelectedServer] = useState(SERVER_OPTIONS[0]);
  const [isServerListOpen, setIsServerListOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState('');

  // Generate embed URL based on content type
  const generateEmbedUrl = useCallback(() => {
    if (seasonNumber && episodeNumber) {
      // TV Show episode
      return `${selectedServer.url}?id=${tmdbId}&season=${seasonNumber}&episode=${episodeNumber}`;
    }
    // Movie
    return `${selectedServer.url}?id=${tmdbId}`;
  }, [tmdbId, seasonNumber, episodeNumber, selectedServer]);

  // Update embed URL when server changes
  useEffect(() => {
    setEmbedUrl(generateEmbedUrl());
    setIsLoading(true);
  }, [generateEmbedUrl]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Select a new server
  const handleServerSelect = (server: typeof SERVER_OPTIONS[0]) => {
    setSelectedServer(server);
    setIsServerListOpen(false);
    setIsLoading(true);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full h-[90vh] bg-gray-950/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative z-20 p-2 sm:p-4 flex items-center justify-between">
          {/* Server Selection */}
          <div className="relative w-full ">
            <button 
              onClick={() => setIsServerListOpen(!isServerListOpen)}
              className="
                bg-white/10 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md 
                flex items-center justify-between w-full
                hover:bg-white/20 transition-colors
              "
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-medium">{selectedServer.name}</span>
                <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1 sm:px-2 py-0.5 rounded-full">
                  {selectedServer.quality}
                </span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 sm:h-5 sm:w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <AnimatePresence>
              {isServerListOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="
                    absolute left-0 mt-2 w-full sm:w-72 bg-white/10 backdrop-blur-xl 
                    rounded-md shadow-lg overflow-hidden z-50
                    max-h-[50vh] overflow-y-auto custom-scrollbar
                  "
                >
                  {SERVER_OPTIONS.map((server) => (
                    <button
                      key={server.name}
                      onClick={() => handleServerSelect(server)}
                      className={`
                        w-full text-left p-2 sm:p-3 flex justify-between items-center
                        hover:bg-white/20 transition-colors
                        ${selectedServer.name === server.name 
                          ? 'bg-white/30 text-white' 
                          : 'text-gray-300'}
                      `}
                    >
                      <div className="flex-grow">
                        <span className="text-xs sm:text-sm font-medium block">{server.name}</span>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{server.description}</p>
                      </div>
                      <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1 sm:px-2 py-0.5 rounded-full ml-2">
                        {server.quality}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="
              text-white/70 hover:text-white 
              transition-colors ml-2
            "
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 sm:h-6 sm:w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Embed Iframe */}
        <div 
          className={`
            flex-grow relative transition-all duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            allowFullScreen
            onLoad={handleIframeLoad}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FlickyEmbed;