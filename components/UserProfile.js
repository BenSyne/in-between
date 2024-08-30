import React from 'react';
import styles from '../styles/UserProfile.module.css';

const UserProfile = ({ profileData }) => {
  console.log('Rendering UserProfile with data:', profileData);

  if (!profileData) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className={styles.profile}>
      <h2>Your Profile</h2>
      {Object.entries(profileData).map(([key, value]) => (
        <div key={key} className={styles.profileItem}>
          <strong>{key.replace(/_/g, ' ')}:</strong> {Array.isArray(value) ? value.join(', ') : value}
        </div>
      ))}
    </div>
  );
};

export default UserProfile;