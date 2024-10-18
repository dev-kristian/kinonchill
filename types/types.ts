// types.ts

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  watchlist_count?: number;
}

export interface TVShow extends Movie {
  first_air_date?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  profile_path: string | null;
  character?: string;
  job?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface DetailsData {
  id: number;
  title?: string;
  name?: string;
  first_air_date?: string;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  backdrop_path: string;
  poster_path: string;
  release_date?: string;
  vote_average: number;
  tagline: string;
  overview: string;
  genres: Genre[];
  status: string;
  contentRating: string | null;
  credits: {
    cast: CrewMember[];
    crew: CrewMember[];
  };
  runtime: number;
  budget: number;
  revenue: number;
  homepage: string;
  imdb_id: string;
  spoken_languages: Array<{ english_name: string }>;
  vote_count: number;
  production_countries: Array<{ name: string }>;
  seasons?: Season[];
  watchlist_count?: number;
  media_type: 'movie' | 'tv';
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
}

export interface ServerLink {
  server: number;
  link: string;
}

export interface BestMatch {
  similarity: number;
  href: string;
}

export interface VideoData {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface TopWatchlistItem extends Movie, TVShow {
  weighted_score: number;
}