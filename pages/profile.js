import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserProfile from '../components/UserProfile';
import styles from '../styles/Profile.module.css';
import { isAuthenticated, refreshToken } from '../utils/auth';

export default function Profile() {
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

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Profile</h1>
      {profileData ? (
        <>
          <UserProfile profileData={profileData} />
          <button className={styles.editButton} onClick={handleEditProfile}>
            Edit Profile
          </button>
        </>
      ) : (
        <div className={styles.emptyProfile}>
          <p>Let's set up your profile to get started.</p>
          <button className={styles.createButton} onClick={handleEditProfile}>
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
}