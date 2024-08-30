import React, { useState } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const UserProfileQuestionnaire = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Learning Style', fields: ['learning_style', 'learning_disabilities', 'adhd', 'focus_issues'] },
    { title: 'Personality', fields: ['reaction_to_failure', 'attitude_towards_winning_losing', 'therapy_experience'] },
    { title: 'Emotional Intelligence', fields: ['emotional_intelligence_understanding', 'emotional_intelligence_hours_spent'] },
    { title: 'Values and Motivations', fields: ['core_values', 'internal_motivators', 'external_motivators'] },
    { title: 'Self-Care', fields: ['self_soothing_methods_healthy', 'self_soothing_methods_unhealthy', 'stress_management_positive', 'stress_management_negative'] },
    { title: 'Personal Growth', fields: ['personal_identity', 'role_models', 'admirable_qualities', 'hobbies', 'challenging_topics'] },
    { title: 'Additional Info', fields: ['favorite_food', 'favorite_food_reason', 'conflict_resolution_approach', 'unique_challenges'] },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const renderField = (field) => {
    // ... (implement renderField logic based on field type)
  };

  return (
    <form onSubmit={handleSubmit} className={styles.questionnaire}>
      <div className={styles.progress}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`${styles.progressStep} ${index <= currentStep ? styles.active : ''}`}
          />
        ))}
      </div>
      <h2 className={styles.stepTitle}>{steps[currentStep].title}</h2>
      {steps[currentStep].fields.map(field => (
        <div key={field} className={styles.field}>
          {renderField(field)}
        </div>
      ))}
      <div className={styles.navigation}>
        {currentStep > 0 && (
          <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className={styles.backButton}>
            Back
          </button>
        )}
        <button type="submit" className={styles.nextButton}>
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default UserProfileQuestionnaire;