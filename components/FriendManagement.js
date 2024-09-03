import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/FriendManagement.module.css';
import io from 'socket.io-client';

const FriendManagement = ({ friends, onAddFriend, onStartChat, onFriendsUpdate, currentUser, userProfile, pendingFriends, socket }) => {
  const [friendUsername, setFriendUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();

  const checkServerHealth = async () => {
    try {
      const response = await fetch('http://localhost:5001/health');
      if (response.ok) {
        console.log('Server is healthy');
        return true;
      }
    } catch (error) {
      console.error('Server health check failed:', error);
    }
    return false;
  };

  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('joinUser', currentUser.id);

      socket.on('newFriendRequest', (request) => {
        console.log('New friend request received:', request);
        onFriendsUpdate();
      });

      socket.on('friendRequestAccepted', (data) => {
        console.log('Friend request accepted:', data);
        onFriendsUpdate();
      });

      return () => {
        socket.off('newFriendRequest');
        socket.off('friendRequestAccepted');
      };
    }
  }, [socket, currentUser]);

  const handleAddFriend = async (username) => {
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ friendUsername: username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add friend');
      }

      const data = await response.json();
      console.log('Friend request sent:', data);
      onFriendsUpdate();
    } catch (error) {
      console.error('Error adding friend:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleAcceptFriend = async (friendId) => {
    try {
      const response = await fetch(`/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: friendId }),
        credentials: 'include',
      });
      if (response.ok) {
        socket.current.emit('acceptFriendRequest', { friendId });
        setPendingFriends(prevPending => prevPending.filter(friend => friend.id !== friendId));
        onFriendsUpdate();
      } else {
        const errorData = await response.json();
        console.error('Error accepting friend request:', errorData.error);
        alert(`Failed to accept friend request: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('An error occurred while accepting the friend request. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (friendUsername.trim()) {
      try {
        const response = await fetch(`/api/users/search?term=${encodeURIComponent(friendUsername)}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results);
        } else {
          console.error('Error searching users:', await response.text());
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSendMessage = async (content, chatId, isAIChat) => {
    try {
      if (!currentUser) {
        throw new Error('User is not authenticated');
      }

      const endpoint = isAIChat ? '/api/ai-chat' : '/api/messages';
      const body = {
        content,
        chatId,
        userProfile,
        isAIChat
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send message: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      // Handle new tokens
      const newToken = response.headers.get('X-New-Token');
      const newRefreshToken = response.headers.get('X-New-Refresh-Token');

      if (newToken && newRefreshToken) {
        document.cookie = `token=${newToken}; path=/; max-age=3600; SameSite=Lax`;
        document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; SameSite=Lax`;
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Helper function to create a unique key for each friend
  const createUniqueKey = (friend) => {
    return `friend-${friend.id}-${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div className={styles.friendManagement}>
      <h3>Friends</h3>
      <ul>
        {friends.filter(friend => friend.id !== currentUser?.id).map((friend) => (
          <li key={`friend-${friend.id}`}>
            {friend.username}
            <button onClick={() => onStartChat(friend.id, false)}>Chat</button>
          </li>
        ))}
      </ul>
      <h3>Pending Friend Requests</h3>
      <ul>
        {pendingFriends.map((friend) => (
          <li key={`pending-${friend.id}`}>
            {friend.friend_username}
            {friend.request_type === 'incoming' ? (
              <button onClick={() => handleAcceptFriend(friend.id)}>Accept</button>
            ) : (
              <span> (Outgoing request)</span>
            )}
          </li>
        ))}
      </ul>
      <h3>Add Friend</h3>
      <div>
        <input
          type="text"
          value={friendUsername}
          onChange={(e) => setFriendUsername(e.target.value)}
          placeholder="Enter friend's username"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <ul>
        {searchResults.filter(user => user.id !== currentUser?.id).map((user) => (
          <li key={`search-${user.id}`}>
            {user.username}
            <button onClick={() => handleAddFriend(user.username)}>Add Friend</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendManagement;