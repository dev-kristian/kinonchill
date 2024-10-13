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
  }