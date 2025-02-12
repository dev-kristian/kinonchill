'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useCustomToast } from '@/hooks/useToast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserData } from '@/context/UserDataContext';

// Import the separated components
import SearchResultItem, {
  SearchResult,
  SearchResultWithStatus,
} from '@/components/friends/SearchResultItem';
import FriendRequestItem, { FriendRequest } from '@/components/friends/FriendRequestItem';
import FriendItem, { Friend } from '@/components/friends/FriendItem';

export default function FriendsPage() {
  const {
    userData,
    friends,
    friendRequests,
    isLoadingFriends,
    isLoadingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useUserData();
  const { showToast } = useCustomToast();

  // Search state & handlers
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultWithStatus[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userData?.uid) {
      showToast('Search Error', 'Please enter a username to search', 'info');
      return;
    }
    setIsSearching(true);
    setError('');
    setSearchResults([]);
    try {
      const response = await fetch(
        `http://localhost:3000/api/friends/search?username=${encodeURIComponent(
          searchQuery.trim()
        )}¤tUserId=${userData.uid}`
      );
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      const filteredResults = data.users.filter((user: SearchResult) =>
        user.uid !== userData.uid && !friends.some(friend => friend.uid === user.uid)
      );
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        setError('No users found');
        showToast('No Results', 'No users found with that username', 'default');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError('An error occurred while searching');
      showToast('Search Error', error.message || 'Failed to search for users. Please try again.', 'info');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUser: SearchResult) => {
    if (!userData) {
      showToast('Authentication Error', 'You must be logged in to send friend requests', 'info');
      return;
    }
    setPendingRequests(prev => new Set(prev).add(targetUser.uid));
    try {
      await sendFriendRequest(targetUser);
      showToast('Friend Request Sent', `Friend request sent to ${targetUser.username}`, 'default');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error:any) {
      showToast('Request Failed', error.message || 'Failed to send friend request. Please try again.', 'error');
    } finally {
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUser.uid);
        return newSet;
      });
    }
  };

  // Friend request processing state & handlers
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const handleAcceptRequest = async (request: FriendRequest) => {
    setProcessingRequests(prev => new Set(prev).add(request.id));
    try {
      await acceptFriendRequest(request);
      showToast('Friend Request Accepted', `You are now friends with ${request.fromUsername}`, 'default');
    } catch (error:any) {
      showToast('Error', error.message || 'Failed to accept friend request. Please try again.', 'error');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    setProcessingRequests(prev => new Set(prev).add(request.id));
    try {
      await rejectFriendRequest(request);
      showToast('Friend Request Rejected', `Friend request from ${request.fromUsername} was rejected`, 'default');
    } catch (error:any) {
      showToast('Error', error.message || 'Failed to reject friend request. Please try again.', 'error');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  // Friend removal state & handler
  const [removingFriends, setRemovingFriends] = useState<Set<string>>(new Set());
  const handleRemoveFriend = async (friend: Friend) => {
    setRemovingFriends(prev => new Set(prev).add(friend.uid));
    try {
      await removeFriend(friend);
      showToast('Friend Removed', `${friend.username} has been removed from your friends list`, 'default');
    } catch (error:any) {
      showToast('Error', error.message || 'Failed to remove friend. Please try again.', 'error');
    } finally {
      setRemovingFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(friend.uid);
        return newSet;
      });
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gradient">Friends</h1>

      {/* Search Section */}
      <section className="mb-8">
        <div className="flex gap-2 max-w-md mb-4">
          <Input
            type="text"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background-light"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="secondary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="space-y-2">
          {isSearching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-lg flex items-center justify-between">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))
          ) : error ? (
            <div className="bg-card p-4 rounded-lg">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <SearchResultItem
                key={user.uid}
                user={user}
                isPending={pendingRequests.has(user.uid)}
                onSendFriendRequest={handleSendFriendRequest}
              />
            ))
          ) : (
            searchQuery && (
              <div className="bg-card p-4 rounded-lg">
                <p className="text-muted-foreground">
                  No users found matching "{searchQuery}"
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Friend Requests Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Friend Requests</h2>
          {friendRequests.length > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              See all
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {isLoadingRequests ? (
            <div className="bg-card p-4 rounded-lg">
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ) : friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <FriendRequestItem
                key={request.id}
                request={request}
                isProcessing={processingRequests.has(request.id)}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))
          ) : (
            <div className="bg-card p-4 rounded-lg">
              <p className="text-muted-foreground">No pending friend requests</p>
            </div>
          )}
        </div>
      </section>

      {/* Friends List Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Friends</h2>
          {friends.length > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              See all
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {isLoadingFriends ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-lg flex items-center justify-between">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <FriendItem
                key={friend.uid}
                friend={friend}
                isRemoving={removingFriends.has(friend.uid)}
                onRemove={handleRemoveFriend}
              />
            ))
          ) : (
            <div className="bg-card p-4 rounded-lg">
              <p className="text-muted-foreground">You haven't added any friends yet</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}