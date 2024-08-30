import React, { useState } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const UserProfileQuestionnaire = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.questionnaire}>
      {/* Add form fields for all profile attributes */}
      <div className={styles.questionCard}>
        <label htmlFor="learning_style">Learning Style:</label>
        <select name="learning_style" value={formData.learning_style || ''} onChange={handleChange} required>
          <option value="">Select...</option>
          <option value="visual">Visual</option>
          <option value="auditory">Auditory</option>
          <option value="kinesthetic">Kinesthetic</option>
          <option value="combination">Combination</option>
        </select>
      </div>
      {/* Add more form fields for other profile attributes */}
      <button type="submit" className={styles.submitButton}>
        {initialData ? 'Update Profile' : 'Create Profile'}
      </button>
    </form>
  );
};

export default UserProfileQuestionnaire;