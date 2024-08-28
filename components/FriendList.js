import React, { useState, useEffect } from 'react';
import styles from '../styles/FriendList.module.css';

const FriendList = ({ onSelectFriend }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const friendsData = await response.json();
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/friends/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const pendingData = await response.json();
        setPendingRequests(pendingData);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      if (response.ok) {
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  return (
    <div className={styles.friendList}>
      <h2>Friends</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} onClick={() => onSelectFriend(friend)}>
            {friend.username}
          </li>
        ))}
      </ul>
      <h3>Pending Requests</h3>
      <ul>
        {pendingRequests.map((request) => (
          <li key={request.id}>
            {request.sender_username}
            <button onClick={() => acceptFriendRequest(request.id)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;