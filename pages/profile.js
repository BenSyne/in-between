import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserProfile from '../components/UserProfile';
import styles from '../styles/Profile.module.css';

export default function Profile() {
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
        throw new Error(`Error fetching profile: ${response.statusText}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Error fetching profile: ${error.message}`);
    } finally {
      setLoading(false);
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
      <h1 className={styles.title}>My Profile</h1>
      {profileData ? (
        <UserProfile profileData={profileData} />
      ) : (
        <div>
          <p>You haven't created a profile yet.</p>
          <button onClick={() => router.push('/profile/edit')}>Create Profile</button>
        </div>
      )}
    </div>
  );
}