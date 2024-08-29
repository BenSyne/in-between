import React from 'react';
import UserProfileQuestionnaire from '../components/UserProfileQuestionnaire';
import styles from '../styles/ProfileSettings.module.css';

const ProfileSettings = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile Settings</h1>
      <UserProfileQuestionnaire />
    </div>
  );
};

export default ProfileSettings;