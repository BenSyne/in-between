import React from 'react';
import styles from '../styles/UserProfile.module.css';

const UserProfile = ({ profileData }) => {
  if (!profileData) {
    return <div className={styles.error}>No profile data available.</div>;
  }

  return (
    <div className={styles.profile}>
      <h2>Your Profile</h2>
      <div className={styles.profileItem}>
        <strong>Username:</strong> {profileData.username}
      </div>
      <div className={styles.profileItem}>
        <strong>Email:</strong> {profileData.email}
      </div>
      {Object.entries(profileData).map(([key, value]) => {
        if (key !== 'username' && key !== 'email' && value !== null) {
          return (
            <div key={key} className={styles.profileItem}>
              <strong>{key.replace(/_/g, ' ')}:</strong> {Array.isArray(value) ? value.join(', ') : value}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default UserProfile;