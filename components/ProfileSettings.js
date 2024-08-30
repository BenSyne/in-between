import React, { useState, useEffect } from 'react';
import UserProfileQuestionnaire from './UserProfileQuestionnaire';
import UserProfile from './UserProfile';
import styles from '../styles/ProfileSettings.module.css';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${publicRuntimeConfig.apiUrl}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching profile: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (answers) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers)
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        const errorText = await response.text();
        throw new Error(`Error updating profile: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchProfileData}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile Settings</h1>
      {!profileData ? (
        <UserProfileQuestionnaire onComplete={handleQuestionnaireComplete} />
      ) : (
        <UserProfile profileData={profileData} />
      )}
    </div>
  );
};

export default ProfileSettings;