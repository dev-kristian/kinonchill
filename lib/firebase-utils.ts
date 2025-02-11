// lib/firebase-utils.ts
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  deleteField,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { SearchResultWithStatus } from '@/types/types';



// lib/firebase-utils.ts
export async function searchUsersByUsername(currentUserId: string, username: string): Promise<SearchResultWithStatus[]> {
  try {
    // Get users matching the search
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', username),
      where('username', '<=', username + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      username: doc.data().username,
      email: doc.data().email,
    }));

    // Get current user's friends data
    const friendsRef = doc(db, 'users', currentUserId, 'friends', 'data');
    const friendsDoc = await getDoc(friendsRef);
    const friendsData = friendsDoc.data() || {};

    // Check request status for each user
    const usersWithStatus = await Promise.all(users.map(async (user) => {
      const requestStatus = {
        exists: false,
        type: undefined as 'sent' | 'received' | undefined,
        status: undefined as 'pending' | 'accepted' | 'rejected' | undefined
      };

      // Check sent requests
      if (friendsData.sentRequests?.[user.uid]) {
        requestStatus.exists = true;
        requestStatus.type = 'sent';
        requestStatus.status = 'pending';
      }

      // Check received requests
      if (friendsData.receivedRequests?.[user.uid]) {
        requestStatus.exists = true;
        requestStatus.type = 'received';
        requestStatus.status = 'pending';
      }

      return {
        ...user,
        requestStatus
      };
    }));

    return usersWithStatus;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}


export async function sendFriendRequest(
  currentUser: { uid: string; username: string },
  targetUser: { uid: string; username: string }
) {
  try {
    // References to both users' documents
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const targetUserRef = doc(db, 'users', targetUser.uid);

    // Create or update the friends subcollection for current user
    const currentUserFriendsRef = doc(db, 'users', currentUser.uid, 'friends', 'data');
    await setDoc(currentUserFriendsRef, {
      sentRequests: {
        [targetUser.uid]: true
      }
    }, { merge: true });

    // Create or update the friends subcollection for target user
    const targetUserFriendsRef = doc(db, 'users', targetUser.uid, 'friends', 'data');
    await setDoc(targetUserFriendsRef, {
      receivedRequests: {
        [currentUser.uid]: true
      }
    }, { merge: true });

    // Create the friend request document
    const requestRef = doc(db, 'users', targetUser.uid, 'friendRequests', currentUser.uid);
    await setDoc(requestRef, {
      fromUid: currentUser.uid,
      fromUsername: currentUser.username,
      status: 'pending',
      timestamp: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function getFriendRequests(userId: string) {
  try {
    const requestsRef = collection(db, 'users', userId, 'friendRequests');
    const q = query(requestsRef, where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return [];
  }
}

// lib/firebase-utils.ts
// Add these new functions

export async function acceptFriendRequest(
  currentUserId: string,
  requesterId: string,
  requesterUsername: string,
  currentUsername: string
) {
  try {
    const batch = writeBatch(db);

    // Update request status
    const requestRef = doc(db, 'users', currentUserId, 'friendRequests', requesterId);
    batch.update(requestRef, { status: 'accepted' });

    // Add to current user's friends list
    const currentUserFriendsRef = doc(db, 'users', currentUserId, 'friends', 'data');
    batch.set(currentUserFriendsRef, {
      friendsList: { [requesterId]: true },
      totalFriends: increment(1),
      receivedRequests: { [requesterId]: deleteField() }
    }, { merge: true });

    // Add to requester's friends list
    const requesterFriendsRef = doc(db, 'users', requesterId, 'friends', 'data');
    batch.set(requesterFriendsRef, {
      friendsList: { [currentUserId]: true },
      totalFriends: increment(1),
      sentRequests: { [currentUserId]: deleteField() }
    }, { merge: true });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

export async function rejectFriendRequest(
  currentUserId: string,
  requesterId: string
) {
  try {
    const batch = writeBatch(db);

    // Update request status
    const requestRef = doc(db, 'users', currentUserId, 'friendRequests', requesterId);
    batch.update(requestRef, { status: 'rejected' });

    // Remove from received requests
    const currentUserFriendsRef = doc(db, 'users', currentUserId, 'friends', 'data');
    batch.set(currentUserFriendsRef, {
      receivedRequests: { [requesterId]: deleteField() }
    }, { merge: true });

    // Remove from sent requests
    const requesterFriendsRef = doc(db, 'users', requesterId, 'friends', 'data');
    batch.set(requesterFriendsRef, {
      sentRequests: { [currentUserId]: deleteField() }
    }, { merge: true });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

// lib/firebase-utils.ts
export async function getUserFriends(userId: string) {
  try {
    const friendsRef = doc(db, 'users', userId, 'friends', 'data');
    const friendsDoc = await getDoc(friendsRef);
    
    if (!friendsDoc.exists() || !friendsDoc.data().friendsList) {
      return [];
    }

    const friendsList = friendsDoc.data().friendsList;
    const friendIds = Object.keys(friendsList);

    const friendsData = await Promise.all(
      friendIds.map(async (friendId) => {
        const userDoc = await getDoc(doc(db, 'users', friendId));
        return {
          uid: userDoc.id,
          ...userDoc.data()
        };
      })
    );

    return friendsData;
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
}
// lib/firebase-utils.ts
// lib/firebase-utils.ts
export async function removeFriend(currentUserId: string, friendId: string) {
  try {
    const batch = writeBatch(db);

    // Remove from current user's friends list
    const currentUserFriendsRef = doc(db, 'users', currentUserId, 'friends', 'data');
    batch.update(currentUserFriendsRef, {
      [`friendsList.${friendId}`]: deleteField(),
      totalFriends: increment(-1)
    });

    // Remove from friend's friends list
    const friendFriendsRef = doc(db, 'users', friendId, 'friends', 'data');
    batch.update(friendFriendsRef, {
      [`friendsList.${currentUserId}`]: deleteField(),
      totalFriends: increment(-1)
    });

    // Clean up friend request documents
    // From current user to friend
    const sentRequestRef = doc(db, 'users', friendId, 'friendRequests', currentUserId);
    batch.delete(sentRequestRef);

    // From friend to current user
    const receivedRequestRef = doc(db, 'users', currentUserId, 'friendRequests', friendId);
    batch.delete(receivedRequestRef);

    // Clean up any pending requests in friends data
    batch.update(currentUserFriendsRef, {
      [`sentRequests.${friendId}`]: deleteField(),
      [`receivedRequests.${friendId}`]: deleteField()
    });

    batch.update(friendFriendsRef, {
      [`sentRequests.${currentUserId}`]: deleteField(),
      [`receivedRequests.${currentUserId}`]: deleteField()
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}

