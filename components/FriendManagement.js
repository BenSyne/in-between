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

  // Add this effect to refresh pending friends when the friends list updates
  useEffect(() => {
    fetchPendingFriends();
  }, [friends]);

  const fetchPendingFriends = async () => {
    try {
      const response = await fetch('/api/friends/pending', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log('Pending friends data:', data);
        setPendingFriends(data);
      } else if (response.status === 401) {
        console.error('Unauthorized access when fetching pending friends');
        router.push('/login');
      } else {
        const errorData = await response.json();
        console.error('Error fetching pending friends:', errorData);
        throw new Error(`Failed to fetch pending friends: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching pending friends:', error);
    }
  };

  const handleAddFriend = async (username) => {
    if (username.trim()) {
      try {
        console.log('Sending friend request for:', username);
        const response = await fetch('/api/friends/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ friendUsername: username }),
          credentials: 'include',
        });

        console.log('Response received:', response.status);
        const data = await response.json();

        if (response.ok) {
          console.log('Friend request sent successfully:', data.message);
          onFriendsUpdate(); // Refresh the friends list
          fetchPendingFriends(); // Refresh pending friends
          setFriendUsername(''); // Clear the input after submitting
          setSearchResults([]); // Clear search results
        } else {
          console.error('Error adding friend:', data.error);
          // Handle specific error cases
          if (response.status === 404) {
            alert('User not found');
          } else if (response.status === 400) {
            alert(data.error);
          } else if (response.status === 401) {
            alert('Unauthorized. Please log in again.');
            router.push('/login');
          } else {
            alert(`An error occurred while adding friend: ${data.error}`);
          }
        }
      } catch (error) {
        console.error('Error in friend request:', error);
        alert('An error occurred while processing your request. Please try again later.');
      }
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
        fetchPendingFriends();
        onFriendsUpdate(); // Refresh the friends list after accepting a friend request
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