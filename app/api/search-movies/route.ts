import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

const TMDB_API_URL = 'https://api.themoviedb.org/3/search/multi';
const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

interface TMDBResponse {
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
  }>;
  status_message?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!TMDB_ACCESS_TOKEN) {
    return NextResponse.json({ message: 'TMDB Access Token is not configured' }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${TMDB_API_URL}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as TMDBResponse;
      return NextResponse.json({ results: data.results });
    } else {
      const errorData = (await response.json()) as TMDBResponse;
      return NextResponse.json({ message: errorData.status_message || 'Search failed' }, { status: response.status });
    }
  } catch (error: unknown) {
    console.error('Error searching movies:', error);
    return NextResponse.json({ message: 'An error occurred while searching for movies' }, { status: 500 });
  }
}
