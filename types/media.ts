// types/media.ts

export type MediaType = 'movie' | 'tv' | 'person';

export interface BaseMedia {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface Movie extends BaseMedia {
  media_type: 'movie';
  title: string;
  release_date: string;
}

export interface TVShow extends BaseMedia {
  media_type: 'tv';
  name: string;
  first_air_date: string;
}

export interface Person extends BaseMedia {
  media_type: 'person';
  name: string;
}

export type MediaItem = Movie | TVShow | Person;