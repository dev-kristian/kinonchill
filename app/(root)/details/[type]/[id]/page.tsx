import React from 'react';
import { notFound } from 'next/navigation';
import CrewCarousel from '@/components/CrewCarousel';
import { DetailsData, ServerLink } from '@/types/types';
import DetailPageWrapper from '@/components/DetailPageWrapper';
import * as cheerio from 'cheerio';
import { BestMatch } from '@/types/types';

interface DetailPageProps {
  params: {
    type: string;
    id: string;
  };
}
const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
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

async function getFilma24Links(title: string, year: string, type: string): Promise<ServerLink[]> {
  if (!workerUrl) {
    console.error('Cloudflare Worker URL is not set');
    return [];
  }

  if (type === 'tv') {
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    const possibleUrls = [
      `https://www.filma24.blog/seriale/${formattedTitle}-seriale-me-titra-shqip/`,
      `https://www.filma24.blog/seriale/${formattedTitle}-me-titra-shqip/`,
      `https://www.filma24.blog/seriale/${formattedTitle}/`
    ];

    for (const url of possibleUrls) {
      try {
        const response = await fetch(`${workerUrl}?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          return [{ server: 1, link: url }];
        }
      } catch (error) {
        console.error(`Error checking URL ${url}:`, error);
      }
    }

    console.error('No valid URL found for TV show:', title);
    return [];
  }

  // Logic for movies
  const searchUrl = `https://www.filma24.blog/search/${encodeURIComponent(title)}`;
  
  try {
    const searchResponse = await fetch(`${workerUrl}?url=${encodeURIComponent(searchUrl)}`);
    if (!searchResponse.ok) {
      throw new Error(`HTTP error! status: ${searchResponse.status}`);
    }
    const searchHtml = await searchResponse.text();
    const $ = cheerio.load(searchHtml);
    
    let bestMatch: BestMatch | null = null;
    
    $('.movie-thumb.col-6').each((_, element) => {
      const $element = $(element);
      const movieTitle = $element.find('h4').text().trim();
      const movieYear = $element.find('.jt-info').eq(1).text().trim();
      const movieHref = $element.find('a.jt').attr('href');
      
      if (movieHref && typeof movieHref === 'string') {
        const titleSimilarity = compareTitles(title, movieTitle);
        const yearMatch = movieYear === year;
        
        const similarity = titleSimilarity + (yearMatch ? 1 : 0);
        
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { similarity, href: movieHref };
        }
      }
    });
    
    if (bestMatch && (bestMatch as BestMatch).href) {
      const serverLinks: ServerLink[] = [];
      
      for (let server = 1; server <= 4; server++) {
        const serverUrl = `${(bestMatch as BestMatch).href}?server=${server}`;
        const moviePageResponse = await fetch(`${workerUrl}?url=${encodeURIComponent(serverUrl)}`);
        if (moviePageResponse.ok) {
          const moviePageHtml = await moviePageResponse.text();
          const $moviePage = cheerio.load(moviePageHtml);
          
          const iframeSrc = $moviePage('#plx iframe').attr('src');
          if (iframeSrc) {
            serverLinks.push({ server, link: iframeSrc });
          }
        }
      }
      
      return serverLinks;
    }
  } catch (error) {
    console.error('Error fetching Filma24 links:', error);
  }
  
  return [];
}

function compareTitles(title1: string, title2: string): number {
  const cleanTitle1 = title1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle2 = title2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let similarity = 0;
  const minLength = Math.min(cleanTitle1.length, cleanTitle2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (cleanTitle1[i] === cleanTitle2[i]) {
      similarity++;
    }
  }
  
  return similarity / Math.max(cleanTitle1.length, cleanTitle2.length);
}

export default async function DetailPage({ params }: DetailPageProps) {
  let details: DetailsData;
  let filma24Links: ServerLink[] = [];

  try {
    details = await getDetails(params.type, params.id);
    const releaseYear = new Date(details.first_air_date || details.release_date || '').getFullYear().toString();
    filma24Links = await getFilma24Links(details.title || details.name || '', releaseYear, params.type);
  } catch (error) {
    console.error('Error fetching details:', error);
    notFound();
  }

  return (
    <div>
      <DetailPageWrapper
        details={details}
        filma24Links={filma24Links}
      />
      <div className="py-8 w-full px-2 md:px-8">
        <CrewCarousel 
          cast={details.credits.cast} 
          crew={details.credits.crew}
          isLoading={false} 
          error={null} 
        />
      </div>
    </div>
  );
}
