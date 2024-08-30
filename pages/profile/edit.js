import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserProfileQuestionnaire from '../../components/UserProfileQuestionnaire';
import styles from '../../styles/ProfileEdit.module.css';

export default function ProfileEdit() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile not found, but this is okay for editing/creating
          setProfileData(null);
        } else {
          throw new Error(`Error fetching profile: ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Error fetching profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfileData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        router.push('/profile');
      } else {
        const errorText = await response.text();
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
      <UserProfileQuestionnaire initialData={profileData} onComplete={handleProfileUpdate} />
      <button className={styles.cancelButton} onClick={() => router.push('/profile')}>
        Cancel
      </button>
    </div>
  );
}