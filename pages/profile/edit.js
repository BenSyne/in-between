import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserProfileQuestionnaire from '../../components/UserProfileQuestionnaire';
import styles from '../../styles/ProfileEdit.module.css';
import { isAuthenticated, refreshToken } from '../../utils/auth';

export default function ProfileEdit() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          router.push('/login');
          return;
        }
      }
      fetchProfileData();
    };

    checkAuthAndFetchProfile();
  }, [router]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            fetchProfileData();
            return;
          } else {
            throw new Error('Authentication failed');
          }
        }
        throw new Error(`Error fetching profile: ${response.statusText}`);
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

  const handleProfileUpdate = async (updatedProfileData) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedProfileData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('Profile updated successfully:', updatedProfile);
        router.push('/profile');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Error updating profile: ${error.message}`);
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
      <h1 className={styles.title}>{profileData ? 'Edit Profile' : 'Create Profile'}</h1>
      <UserProfileQuestionnaire initialData={profileData || {}} onComplete={handleProfileUpdate} />
      <button className={styles.cancelButton} onClick={() => router.push('/profile')}>
        Cancel
      </button>
    </div>
  );
}