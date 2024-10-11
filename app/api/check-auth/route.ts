import { NextResponse } from 'next/server';

const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/11';
const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

export async function GET() {
  if (!TMDB_ACCESS_TOKEN) {
    return NextResponse.json({ message: 'TMDB Access Token is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(TMDB_API_URL, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Authentication successful' });
    } else {
      const errorData = await response.json();
      return NextResponse.json({ message: errorData.status_message || 'Authentication failed' }, { status: response.status });
    }
  } catch (error: unknown) {
    console.error('Error checking authentication:', error);
    return NextResponse.json({ message: 'An error occurred while checking authentication' }, { status: 500 });
  }
}