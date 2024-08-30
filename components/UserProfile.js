import React, { useState, useEffect } from 'react';
import styles from '../styles/UserProfile.module.css';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchFriends();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      console.log('Fetching user profile from:', `${publicRuntimeConfig.apiUrl}/users/profile`);
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/users/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      console.log('Profile response status:', response.status);
      if (response.ok) {
        const profileData = await response.json();
        console.log('Profile data:', profileData);
        setProfile(profileData);
      } else if (response.status === 404) {
        console.log('Profile not found');
        setError('Profile not found. Please complete the questionnaire.');
      } else {
        const errorData = await response.text();
        console.error('Error fetching profile:', errorData);
        setError(`An error occurred while fetching the profile: ${errorData}`);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('An error occurred while fetching the profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/friends`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (response.ok) {
        const friendsData = await response.json();
        setFriends(friendsData);
      } else {
        console.error('Error fetching friends:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!profile) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className={styles.profile}>
      <h2>Your Profile</h2>
      {Object.entries(profile).map(([key, value]) => (
        <div key={key} className={styles.profileItem}>
          <strong>{key.replace(/_/g, ' ')}:</strong> {Array.isArray(value) ? value.join(', ') : value}
        </div>
      ))}
      <h3>Friends</h3>
      {friends.length > 0 ? (
        <ul>
          {friends.map(friend => (
            <li key={friend.id}>{friend.username}</li>
          ))}
        </ul>
      ) : (
        <p>No friends yet. Start connecting with other users!</p>
      )}
    </div>
  );
};

export default UserProfile;