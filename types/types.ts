// types.ts

export interface Media {
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

export interface DetailsData extends Media{
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  backdrop_path: string;
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
  spoken_languages: Array<{ english_name: string }>;
  vote_count: number;
  production_countries: Array<{ name: string }>;
  seasons?: Season[];
  external_ids?: {
    imdb_id?: string;
  };
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

export interface TopWatchlistItem extends Media{
  weighted_score: number;
}

export interface DatePopularity {
  date: string;
  count: number;
  users: string[];
  hours: { [hour: number]: { count: number; users: string[] } };
}

export interface DateTimeSelection {
  date: Date;
  hours: number[] | 'all';
}

export interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
}

export type NotificationStatus = 'allowed' | 'denied' | 'unsupported';

export interface UserData {
  username: string;
  email?: string; // Make email optional
  createdAt?: Date;
  updatedAt?: Date;
  setupCompleted?: boolean;
  uid?: string;
  watchlist: {
    movie: { [movieId: string]: boolean };
    tv: { [tvId: string]: boolean };
  };
  notification?: NotificationStatus;
}

export interface NotificationSubscriptionUIProps {
  isSupported: boolean | null;
  isIOS166OrHigher: boolean;
  isStandalone: boolean;
  userData: UserData | null;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  handleUpdateNotificationStatus: (status: NotificationStatus) => Promise<void>;
  handleSubscribe: () => Promise<void>;
}

export interface Poll {
  id: string;
  movieTitles: string[];
  votes: { [username: string]: string[] };
}

export interface Session {
  id: string;
  createdAt: Date;
  createdBy: string;
  userDates: {
    [username: string]: {
      date: string;
      hours: string[] | 'all';
    }[];
  };
  poll?: Poll;
  status: 'active' | 'inactive';
}
export interface SeasonDetails {
  _id: string;
  air_date: string;
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
  episodes: Episode[];
}

export interface Episode {
  air_date: string;
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
}

// types/types.ts
// Add these to your existing types
export interface FriendRequest {
  uid: string;
  username: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}

export interface UserFriends {
  totalFriends: number;
  friendsList: { [uid: string]: boolean };
  sentRequests: { [uid: string]: boolean };
  receivedRequests: { [uid: string]: boolean };
}
export interface SearchResult {
  uid: string;
  username: string;
  email?: string;
}

export interface SearchResultWithStatus extends SearchResult {
  requestStatus?: {
    exists: boolean;
    type?: 'sent' | 'received';
    status?: 'pending' | 'accepted' | 'rejected';
  };
}