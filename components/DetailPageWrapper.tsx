'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MediaPlayer from './MediaPlayer';
import { DetailsData, ServerLink } from '@/types/types';

interface DetailPageWrapperProps {
  details: DetailsData;
  filma24Links: ServerLink[];
}
const getMediaType = (details: DetailsData): 'tv' | 'movie' => {
    return details.number_of_seasons !== undefined ? 'tv' : 'movie';
  };
const DetailPageWrapper: React.FC<DetailPageWrapperProps> = ({ details, filma24Links }) => {
    const [activeServer, setActiveServer] = useState<string | null>(null);
    const mediaType = getMediaType(details);
  
    const handleServerClick = (link: string) => {
      setActiveServer(null);
      setTimeout(() => setActiveServer(link), 100);
    };
  
    const releaseYear = new Date(details.first_air_date || details.release_date || '').getFullYear();

  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'border-green-500';
    if (score >= 5) return 'border-yellow-500';
    return 'border-red-500';
  };
  


  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        <Image
          src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
          alt={details.title || details.name || 'Backdrop'}
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
          className="filter blur-sm"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      <div className="relative z-10 text-white p-4 md:p-8 max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-center">
        {activeServer ? (
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full flex items-center mb-4">
              <button
                onClick={() => setActiveServer(null)}
                className="mr-4 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
              >
                Back
              </button>
              <h1 className="text-2xl md:text-4xl font-bold">
                {details.title || details.name}
              </h1>
            </div>
            <div className="w-full h-full">
              <MediaPlayer src={activeServer} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.title || details.name || 'Poster'}
                width={500}
                height={750}
                className="rounded-lg shadow-2xl mx-auto md:mx-0"
              />
<div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
        {mediaType === 'tv' && filma24Links.length > 0 ? (
          <a
            href={filma24Links[0].link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
          >
            Watch on Filma24
          </a>
        ) : (
          filma24Links.map((serverLink) => (
            <button
              key={serverLink.server}
              onClick={() => handleServerClick(serverLink.link)}
              className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
            >
              Watch Server {serverLink.server}
            </button>
          ))
        )}
      </div>
            </div>
            <div className="w-full md:w-2/3 md:ml-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                {details.title || details.name} <span className="text-2xl md:text-3xl font-light">({releaseYear})</span>
              </h1>
              <div className="mb-4 flex flex-wrap items-center space-x-4">
                {details.contentRating && (
                  <span className="text-sm font-medium py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    {details.contentRating}
                  </span>
                )}
                <span className="text-sm font-light">
                  {details.genres.map((genre) => genre.name).join(', ')}
                </span>
              </div>
              <div className="flex items-center mb-6 space-x-4">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm border-4 ${getScoreColor(details.vote_average)}`}>
                  <span className="text-xl md:text-2xl font-bold">
                    {details.vote_average.toFixed(1)}
                  </span>
                </div>
                <p className="text-lg md:text-xl font-light italic">{details.tagline}</p>
              </div>
              <div className="mb-6">
                <p className="text-base md:text-lg leading-relaxed">{details.overview}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-400">First Air Date</h3>
                  <p>{details.first_air_date || details.release_date}</p>
                </div>
                {details.number_of_seasons && (
                  <div>
                    <h3 className="font-semibold text-gray-400">Seasons</h3>
                    <p>{details.number_of_seasons}</p>
                  </div>
                )}
                {details.number_of_episodes && (
                  <div>
                    <h3 className="font-semibold text-gray-400">Episodes</h3>
                    <p>{details.number_of_episodes}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-400">Status</h3>
                  <p>{details.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPageWrapper;