// components/PopularItems.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MoviePoster from './MoviePoster';

interface PopularItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
}

const PopularItems: React.FC = () => {
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getCountFromServer(usersCollection);
        const count = snapshot.data().count;
        console.log('Total users:', count);
        setTotalUsers(count);
      } catch (error) {
        console.error('Error fetching total users:', error);
        setError('Failed to fetch user count');
      }
    };

    const fetchPopularItems = async () => {
      try {
        console.log('Fetching popular items for', totalUsers, 'users');
        const movieQuery = query(
          collection(db, 'movies'),
          where('watchlist_count', '==', totalUsers)
        );
        const tvQuery = query(
          collection(db, 'tvShows'),
          where('watchlist_count', '==', totalUsers)
        );

        const [movieDocs, tvDocs] = await Promise.all([
          getDocs(movieQuery),
          getDocs(tvQuery)
        ]);

        console.log('Movies found:', movieDocs.size);
        console.log('TV shows found:', tvDocs.size);

        const movies = movieDocs.docs.map(doc => ({ ...doc.data(), media_type: 'movie' } as PopularItem));
        const tvShows = tvDocs.docs.map(doc => ({ ...doc.data(), media_type: 'tv' } as PopularItem));

        setPopularItems([...movies, ...tvShows]);
      } catch (error) {
        console.error('Error fetching popular items:', error);
        setError('Failed to fetch popular items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalUsers();
    if (totalUsers > 0) {
      fetchPopularItems();
    }
  }, [totalUsers]);

  if (isLoading) {
    return <div>Loading popular items...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (popularItems.length === 0) {
    return <div>No items are currently on everyone's watchlist.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {popularItems.map((item) => (
        <MoviePoster key={`${item.media_type}-${item.id}`} movie={item} showMediaType={true} />
      ))}
    </div>
  );
};

export default PopularItems;