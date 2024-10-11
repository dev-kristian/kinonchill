// pages/api/check-auth.ts
import { NextApiRequest, NextApiResponse } from 'next';

const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/11';
const TMDB_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TMDB_ACCESS_TOKEN) {
    return res.status(500).json({ message: 'TMDB Access Token is not configured' });
  }

  try {
    const response = await fetch(TMDB_API_URL, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      res.status(200).json({ message: 'Authentication successful' });
    } else {
      const errorData = await response.json();
      res.status(response.status).json({ message: errorData.status_message || 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while checking authentication' });
  }
}