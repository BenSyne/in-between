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
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching profile data...');
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile data response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching profile: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile data:', data);
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
      console.log('Submitting questionnaire answers:', answers);
      const response = await fetch(`${publicRuntimeConfig.apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers)
      });

      console.log('Questionnaire submission response status:', response.status);
      if (response.ok) {
        console.log('Profile updated successfully');
        fetchProfileData(); // Refresh profile data
      } else {
        const errorText = await response.text();
        throw new Error(`Error updating profile: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      setError(error.message);
    }
  };

  console.log('Rendering ProfileSettings. Loading:', loading, 'Error:', error, 'ProfileData:', profileData);

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

  const showQuestionnaire = !profileData || Object.keys(profileData).length === 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile Settings</h1>
      {showQuestionnaire ? (
        <div>
          <p>We need some information to complete your profile.</p>
          <UserProfileQuestionnaire onComplete={handleQuestionnaireComplete} />
        </div>
      ) : (
        <UserProfile profileData={profileData} />
      )}
    </div>
  );
};

export default ProfileSettings;