// types/user.ts
import { User } from 'firebase/auth';

// Authentication State (for AuthContext, etc.)
export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

// Basic User Data (from Firebase Auth)
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

// User Profile (for storing additional user information)
export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Friend-related types
export interface Friend {
  uid: string;
  username: string;
  email?: string;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string; // Keep as string, as Firebase timestamps are strings
}

export interface UserFriends {
  totalFriends: number;
  friendsList: { [uid: string]: boolean };
  sentRequests: { [uid: string]: boolean };
  receivedRequests: { [uid: string]: boolean };
}

// Search-related types
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

export type NotificationStatus = 'allowed' | 'denied' | 'unsupported';

export interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
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