'use client'
import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MovieResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
}

export default function MovieSearch() {
  const [query, setQuery] = useState<string>('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<MovieResult[]>([]);

  const searchMovies = async () => {
    setSearchStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/search-movies?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setSearchStatus('success');
        setResults(data.results);
      } else {
        setSearchStatus('error');
        setErrorMessage(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchStatus('error');
      setErrorMessage('An error occurred while searching for movies');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">TMDB Movie Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Enter movie name"
        className="border p-2 mb-4 w-full"
      />
      <Button onClick={searchMovies} disabled={searchStatus === 'loading'}>
        {searchStatus === 'loading' ? 'Searching...' : 'Search'}
      </Button>

      {searchStatus === 'success' && results.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Results:</h2>
          <ul>
            {results.map((result) => (
              <li key={result.id} className="mb-2">
                {result.title || result.name} ({result.release_date || result.first_air_date})
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchStatus === 'error' && (
        <Alert className="mt-4" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
