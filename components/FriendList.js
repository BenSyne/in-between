import React, { useState, useEffect } from 'react';
import styles from '../styles/FriendList.module.css';

const FriendList = ({ onSelectFriend }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        credentials: 'include',
      });
      if (response.ok) {
        const friendsData = await response.json();
        setFriends(friendsData);
      } else if (response.status === 401) {
        console.log('Token expired, attempting to refresh');
        const refreshed = await refreshToken();
        if (refreshed) {
          fetchFriends(); // Retry after refreshing
        }
      } else {
        console.error('Error fetching friends:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  return (
    <div className={styles.friendList}>
      <h3>Friends</h3>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id} onClick={() => onSelectFriend(friend.id)}>
            {friend.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;