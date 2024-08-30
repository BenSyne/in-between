import React, { useState, useEffect } from 'react';
import UserProfileQuestionnaire from '../components/UserProfileQuestionnaire';
import UserProfile from '../components/UserProfile';
import styles from '../styles/ProfileSettings.module.css';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

const { publicRuntimeConfig } = getConfig();

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('ProfileSettings component mounted');
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      const response = await fetch('http://localhost:5001/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (answers) => {
    console.log('Questionnaire completed with answers:', answers);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers)
      });

      if (response.ok) {
        console.log('Profile created successfully');
        fetchProfileData(); // Refresh profile data
      } else {
        const errorText = await response.text();
        console.error('Error creating profile:', errorText);
        setError(`Error creating profile: ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setError(`Error submitting questionnaire: ${error.message}`);
    }
  };

  console.log('Rendering ProfileSettings. Loading:', loading, 'Error:', error, 'ProfileData:', profileData);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
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