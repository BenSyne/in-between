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
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        router.push('/login');
        return;
      }

      const response = await fetch(`${publicRuntimeConfig.apiUrl}/users/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);
        setProfileData(data);
      } else if (response.status === 404) {
        console.log('Profile not found');
        setProfileData(null);
      } else {
        const errorText = await response.text();
        console.error('Error fetching profile:', errorText);
        setError(`Error fetching profile: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Error fetching profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (answers) => {
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