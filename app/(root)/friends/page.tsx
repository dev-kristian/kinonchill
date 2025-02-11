// app/(root)/friends/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, Loader2, UserRound, Check, X, UserMinus, Clock, UserCheck } from "lucide-react"
import { 
  searchUsersByUsername, 
  sendFriendRequest, 
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getUserFriends,
  removeFriend
} from '@/lib/firebase-utils'
import { useUserData } from '@/context/UserDataContext'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchResult {
  uid: string;
  username: string;
  email?: string;
}
interface SearchResultWithStatus extends SearchResult {
    requestStatus?: {
      exists: boolean;
      type?: 'sent' | 'received';
      status?: 'pending' | 'accepted' | 'rejected';
    };
  }
interface FriendRequest {
  id: string;
  fromUid: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any;
}

interface Friend {
  uid: string;
  username: string;
  email?: string;
}

export default function FriendsPage() {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultWithStatus[]>([]);
  const [isSearching, setIsSearching] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [isLoadingFriends, setIsLoadingFriends] = useState(true)
  const [error, setError] = useState('')
  const [removingFriends, setRemovingFriends] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (userData?.uid) {
      loadFriendRequests();
      loadFriends();
    }
  }, [userData?.uid]);

  const loadFriendRequests = async () => {
    if (!userData?.uid) return;
    
    setIsLoadingRequests(true);
    try {
      const requests = await getFriendRequests(userData.uid);
      setFriendRequests(requests as FriendRequest[]);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load friend requests",
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadFriends = async () => {
    if (!userData?.uid) return;
    
    setIsLoadingFriends(true);
    try {
      const friendsList = await getUserFriends(userData.uid);
      setFriends(friendsList as Friend[]);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load friends list",
      });
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userData?.uid) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Please enter a username to search",
      });
      return;
    }
  
    setIsSearching(true);
    setError('');
    setSearchResults([]);
  
    try {
      const results = await searchUsersByUsername(userData.uid, searchQuery.trim());
      const filteredResults = results.filter(user => 
        user.uid !== userData?.uid && 
        !friends.some(friend => friend.uid === user.uid)
      );
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setError('No users found');
        toast({
          variant: "default",
          title: "No Results",
          description: "No users found with that username",
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search for users. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  }
  

  const handleSendFriendRequest = async (targetUser: SearchResult) => {
    if (!userData) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to send friend requests",
      });
      return;
    }

    setPendingRequests(prev => new Set(prev).add(targetUser.uid));

    try {
      await sendFriendRequest(
        { uid: userData.uid!, username: userData.username },
        { uid: targetUser.uid, username: targetUser.username }
      );
      
      toast({
        title: "Friend Request Sent",
        description: `Friend request sent to ${targetUser.username}`,
      });
      
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUser.uid);
        return newSet;
      });
      
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Failed to send friend request. Please try again.",
      });
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUser.uid);
        return newSet;
      });
    }
  }

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!userData?.uid || !userData.username) return;

    setProcessingRequests(prev => new Set(prev).add(request.id));
    
    try {
      await acceptFriendRequest(
        userData.uid,
        request.fromUid,
        request.fromUsername,
        userData.username
      );
      
      setFriendRequests(prev => 
        prev.filter(req => req.id !== request.id)
      );
      
      // Reload friends list after accepting
      await loadFriends();
      
      toast({
        title: "Friend Request Accepted",
        description: `You are now friends with ${request.fromUsername}`,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  }

  const handleRejectRequest = async (request: FriendRequest) => {
    if (!userData?.uid) return;

    setProcessingRequests(prev => new Set(prev).add(request.id));

    try {
      await rejectFriendRequest(userData.uid, request.fromUid);
      
      setFriendRequests(prev => 
        prev.filter(req => req.id !== request.id)
      );
      
      toast({
        title: "Friend Request Rejected",
        description: `Friend request from ${request.fromUsername} was rejected`,
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject friend request. Please try again.",
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  }
  const handleRemoveFriend = async (friend: Friend) => {
    if (!userData?.uid) return;
  
    setRemovingFriends(prev => new Set(prev).add(friend.uid));
  
    try {
      await removeFriend(userData.uid, friend.uid);
      setFriends(prev => prev.filter(f => f.uid !== friend.uid));
      toast({
        title: "Friend Removed",
        description: `${friend.username} has been removed from your friends list`,
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove friend. Please try again.",
      });
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
{/* Search Section */}
<section className="mb-8">
  {/* Search Input */}
  <div className="flex gap-2 max-w-md mb-4">
    <Input
      type="text"
      placeholder="Search users by username..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="bg-background-light"
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSearch();
      }}
    />
    <Button 
      variant="secondary" 
      onClick={handleSearch}
      disabled={isSearching}
    >
      {isSearching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Search className="h-4 w-4" />
      )}
    </Button>
  </div>

  {/* Search Results */}
  <div className="space-y-2">
    {isSearching ? (
      // Loading skeletons
      Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card p-4 rounded-lg flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      ))
    ) : error ? (
      // Error state
      <div className="bg-card p-4 rounded-lg">
        <p className="text-muted-foreground">{error}</p>
      </div>
    ) : searchResults.length > 0 ? (
      // Results list
      searchResults.map((user) => (
        <div 
          key={user.uid}
          className="bg-card p-4 rounded-lg flex items-center justify-between hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-full">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{user.username}</p>
              {user.email && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          
          {user.requestStatus?.exists ? (
            // Show status for existing requests
            <Button 
              variant="ghost" 
              size="sm"
              disabled={true}
              className="text-muted-foreground"
            >
              {user.requestStatus.type === 'sent' ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Request Pending
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Request Received
                </>
              )}
            </Button>
          ) : (
            // Add friend button for new users
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-primary/20"
              onClick={() => handleSendFriendRequest(user)}
              disabled={pendingRequests.has(user.uid)}
            >
              {pendingRequests.has(user.uid) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {pendingRequests.has(user.uid) ? 'Sending...' : 'Add Friend'}
            </Button>
          )}
        </div>
      ))
    ) : searchQuery && (
      // Empty state with search query
      <div className="bg-card p-4 rounded-lg">
        <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
      </div>
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
              <div 
                key={request.id}
                className="bg-card p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-secondary p-2 rounded-full">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{request.fromUsername}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(request.timestamp?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-green-500/20"
                    onClick={() => handleAcceptRequest(request)}
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {processingRequests.has(request.id) ? 'Accepting...' : 'Accept'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive/20"
                    onClick={() => handleRejectRequest(request)}
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    {processingRequests.has(request.id) ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </div>
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
        <div 
          key={friend.uid}
          className="bg-card p-4 rounded-lg flex items-center justify-between hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-full">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{friend.username}</p>
              {friend.email && (
                <p className="text-sm text-muted-foreground">{friend.email}</p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-destructive/20"
            onClick={() => handleRemoveFriend(friend)}
            disabled={removingFriends.has(friend.uid)}
          >
            {removingFriends.has(friend.uid) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserMinus className="h-4 w-4 mr-2" />
            )}
            {removingFriends.has(friend.uid) ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      ))
    ) : (
      <div className="bg-card p-4 rounded-lg">
        <p className="text-muted-foreground">You haven't added any friends yet</p>
      </div>
    )}
  </div>
</section>
    </main>
  )
}
