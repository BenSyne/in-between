import React, { useState } from 'react';
import styles from '../styles/UserSearch.module.css';

const UserSearch = ({ onAddFriend }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/search?term=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className={styles.userSearch}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((user) => (
          <li key={user.id}>
            {user.username}
            <button onClick={() => onAddFriend(user.id)}>Add Friend</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;