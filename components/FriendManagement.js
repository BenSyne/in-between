import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/FriendManagement.module.css';

const FriendManagement = ({ friends, onAddFriend, onStartChat, onFriendsUpdate, currentUser, userProfile }) => {
  const [friendUsername, setFriendUsername] = useState('');
  const [pendingFriends, setPendingFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      fetchPendingFriends();
    }
  }, [currentUser]);

  const fetchPendingFriends = async () => {
    try {
      const response = await fetch('/api/friends/pending', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPendingFriends(data);
      } else if (response.status === 401) {
        console.error('Unauthorized access when fetching pending friends');
        router.push('/login');
      } else {
        throw new Error(`Failed to fetch pending friends: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching pending friends:', error);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (friendUsername.trim()) {
      await onAddFriend(friendUsername);
      setFriendUsername('');
      setSearchResults([]);
      onFriendsUpdate(); // Refresh the friends list after adding a new friend
    }
  };

  const handleAcceptFriend = async (friendId) => {
    try {
      const response = await fetch(`/api/friends/accept/${friendId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchPendingFriends();
        onFriendsUpdate(); // Refresh the friends list after accepting a friend request
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleSearch = async () => {
    if (friendUsername.trim()) {
      try {
        const response = await fetch(`/api/users/search?term=${friendUsername}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error searching users:', error);
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
        {friends.map((friend) => (
          <li key={createUniqueKey(friend)}>
            {friend.username}
            <button onClick={() => onStartChat(friend.id, false)}>Chat</button>
          </li>
        ))}
      </ul>
      <button onClick={() => onStartChat(null, true)}>Start AI Chat</button>
      <h3>Pending Friend Requests</h3>
      <ul>
        {pendingFriends.map((friend) => (
          <li key={`pending-${createUniqueKey(friend)}`}>
            {friend.username}
            <button onClick={() => handleAcceptFriend(friend.id)}>Accept</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddFriend}>
        <input
          type="text"
          value={friendUsername}
          onChange={(e) => setFriendUsername(e.target.value)}
          onKeyUp={handleSearch}
          placeholder="Search for a friend"
        />
        <button type="submit">Add Friend</button>
      </form>
      {searchResults.length > 0 && (
        <ul className={styles.searchResults}>
          {searchResults.map((user) => (
            <li key={user.id}>
              {user.username}
              <button onClick={() => onAddFriend(user.username)}>Add</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendManagement;