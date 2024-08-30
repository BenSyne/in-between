import React, { useState, useEffect } from 'react';
import UserProfileQuestionnaire from '../components/UserProfileQuestionnaire';
import UserProfile from '../components/UserProfile';
import styles from '../styles/ProfileSettings.module.css';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

const { publicRuntimeConfig } = getConfig();

const ProfileSettings = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkProfileExists();
  }, []);

  const checkProfileExists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('No authentication token found. Please log in again.');
        router.push('/login');
        return;
      }
      console.log('Fetching profile from:', `${publicRuntimeConfig.apiUrl}/profile`);
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);
        setProfileExists(true);
        setShowProfile(true);
      } else if (response.status === 404) {
        console.log('Profile not found');
        setProfileExists(false);
        setShowProfile(false);
      } else {
        const errorText = await response.text();
        console.error('Error checking profile:', errorText);
        setError(`Error checking profile: ${errorText}`);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setError(`Error checking profile: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('Profile check completed');
    }
  };

  const handleQuestionnaireComplete = () => {
    setShowProfile(true);
    setProfileExists(true);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile Settings</h1>
      {!showProfile || !profileExists ? (
        <UserProfileQuestionnaire onComplete={handleQuestionnaireComplete} />
      ) : (
        <UserProfile />
      )}
      {profileExists && !showProfile && (
        <button onClick={() => setShowProfile(true)}>View Profile</button>
      )}
      {showProfile && (
        <button onClick={() => setShowProfile(false)}>Edit Profile</button>
      )}
    </div>
  );
};

export default ProfileSettings;