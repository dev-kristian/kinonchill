// types.ts
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  vote_average?: number;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  watchlist_count?: number;  // Add this line
}

// types.ts
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
  backdrop_path: string;
  poster_path: string;
  first_air_date?: string;
  release_date?: string;
  vote_average: number;
  tagline: string;
  overview: string;
  genres: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  contentRating: string | null;
  credits: {
    cast: CrewMember[];
    crew: CrewMember[];
  };
}