// types/context.ts
import { Media, UserData, Friend, FriendRequest, NotificationStatus } from './'; 

export interface UserDataContextType {
    userData: UserData | null;
    isLoading: boolean;
    watchlistItems: {
      movie: Media[];
      tv: Media[];
    };
    addToWatchlist: (item: Media, mediaType: 'movie' | 'tv') => Promise<void>;
    removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => Promise<void>;
    updateNotificationStatus: (status: NotificationStatus) => Promise<void>;
    friends: Friend[];
    friendRequests: FriendRequest[];
    isLoadingFriends: boolean;
    isLoadingRequests: boolean;
    sendFriendRequest: (targetUser: { uid: string; username: string }) => Promise<void>;
    acceptFriendRequest: (request: FriendRequest) => Promise<void>;
    rejectFriendRequest: (request: FriendRequest) => Promise<void>;
    removeFriend: (friend: Friend) => Promise<void>;
  }