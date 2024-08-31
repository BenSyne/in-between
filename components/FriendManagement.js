import React, { useState, useEffect } from 'react';
import styles from '../styles/FriendManagement.module.css';

const FriendManagement = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    // Fetch friend requests logic
  };

  const handleSearch = async () => {
    // Search users logic
  };

  const handleSendRequest = async (userId) => {
    // Send friend request logic
  };

  const handleAcceptRequest = async (requestId) => {
    // Accept friend request logic
  };

  return (
    <div className={styles.friendManagement}>
      <h2>Friend Requests</h2>
      <ul>
        {friendRequests.map(request => (
          <li key={request.id}>
            {request.sender.username}
            <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
          </li>
        ))}
      </ul>

      <h2>Find Friends</h2>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <ul>
        {searchResults.map(user => (
          <li key={user.id}>
            {user.username}
            <button onClick={() => handleSendRequest(user.id)}>Send Request</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendManagement;