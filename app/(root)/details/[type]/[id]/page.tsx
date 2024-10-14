import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import CrewCarousel from '@/components/CrewCarousel';
import { DetailsData, CrewMember } from '@/types/types'; // Update the import path as necessary

interface DetailPageProps {
  params: {
    type: string;
    id: string;
  };
}

async function getDetails(type: string, id: string): Promise<DetailsData> {
  const bearerToken = process.env.NEXT_PRIVATE_TMDB_API_KEY;
  const detailsUrl = `https://api.themoviedb.org/3/${type}/${id}?language=en-US`;
  const contentRatingsUrl = `https://api.themoviedb.org/3/${type}/${id}/content_ratings`;
  const creditsUrl = `https://api.themoviedb.org/3/${type}/${id}/credits`;

  const [detailsResponse, contentRatingsResponse, creditsResponse] = await Promise.all([
    fetch(detailsUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept': 'application/json'
      },
      next: { revalidate: 3600 }
    }),
    type === 'tv' ? fetch(contentRatingsUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept': 'application/json'
      },
      next: { revalidate: 3600 }
    }) : null,
    fetch(creditsUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })
  ]);

  if (!detailsResponse.ok || !creditsResponse.ok) {
    throw new Error(`Failed to fetch details: ${detailsResponse.status}`);
  }

  const detailsData = await detailsResponse.json();
  const creditsData = await creditsResponse.json();
  let contentRating = null;

  if (contentRatingsResponse) {
    const contentRatingsData = await contentRatingsResponse.json();
    const usRating = contentRatingsData.results.find((rating: { iso_3166_1: string }) => rating.iso_3166_1 === 'US');
    contentRating = usRating ? usRating.rating : null;
  }

  return { ...detailsData, contentRating, credits: creditsData };
}

const getScoreColor = (score: number): string => {
  if (score >= 7) return 'border-green-500';
  if (score >= 5) return 'border-yellow-500';
  return 'border-red-500';
};

export default async function DetailPage({ params }: DetailPageProps) {
  let details: DetailsData;
  try {
    details = await getDetails(params.type, params.id);
  } catch (error) {
    console.error('Error fetching details:', error);
    notFound();
  }

  const releaseYear = new Date(details.first_air_date || details.release_date || '').getFullYear();
  const crewMembers: CrewMember[] = [...details.credits.cast, ...details.credits.crew];

  return (
    <div>
      <div className="relative min-h-[calc(100vh-60px)]">
        <div className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
            alt={details.title || details.name || 'Backdrop'}
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
            className="filter blur-md"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="relative z-10 text-white p-2 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto flex flex-col">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-2/3 md:w-1/3 mb-6 md:mb-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.title || details.name || 'Poster'}
                width={300}
                height={450}
                className="rounded-lg shadow-2xl mx-auto md:mx-0"
              />
            </div>
            <div className="w-full md:w-2/3 md:ml-10 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                {details.title || details.name} <span className="text-2xl md:text-3xl font-light">({releaseYear})</span>
              </h1>
              <div className="mb-4 flex flex-wrap items-center justify-center md:justify-start space-x-4">
                {details.contentRating && (
                  <span className="text-sm font-medium py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    {details.contentRating}
                  </span>
                )}
                <span className="text-sm font-light">
                  {details.genres.map((genre) => genre.name).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start mb-6 space-x-4">
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
        </div>
      </div>
      <div className="py-8 w-full px-2 md:px-8">
        <CrewCarousel crewMembers={crewMembers} isLoading={false} error={null} />
      </div>
    </div>
  );
}