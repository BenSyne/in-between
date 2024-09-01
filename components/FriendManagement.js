import React, { useState, useEffect } from 'react';
import styles from '../styles/FriendManagement.module.css';

const FriendManagement = ({ friends, onStartChat, onFriendsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends/pending', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/users/search?term=${searchTerm}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
        credentials: 'include',
      });
      if (response.ok) {
        setSearchResults(prevResults => prevResults.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
        credentials: 'include',
      });
      if (response.ok) {
        fetchPendingRequests();
        onFriendsUpdate();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  return (
    <div className={styles.friendManagement}>
      <h2>Friend Management</h2>
      <div className={styles.searchSection}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className={styles.searchResults}>
        {searchResults.map(user => (
          <div key={user.id} className={styles.userItem}>
            {user.username}
            <button onClick={() => handleSendRequest(user.id)}>Send Request</button>
          </div>
        ))}
      </div>
      <h3>Pending Requests</h3>
      <div className={styles.pendingRequests}>
        {pendingRequests.map(request => (
          <div key={request.id} className={styles.requestItem}>
            {request.sender_username}
            <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
          </div>
        ))}
      </div>
      <h3>Friends</h3>
      <div className={styles.friendsList}>
        {friends.map(friend => (
          <div key={friend.id} className={styles.friendItem}>
            {friend.username}
            <button onClick={() => onStartChat(friend.id)}>Start Chat</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendManagement;