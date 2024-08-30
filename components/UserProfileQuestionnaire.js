import React, { useState } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const UserProfileQuestionnaire = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [currentStep, setCurrentStep] = useState(0);

  const questions = [
    { name: 'learning_style', label: 'Learning Style', type: 'select', options: ['visual', 'auditory', 'kinesthetic', 'combination'] },
    { name: 'learning_disabilities', label: 'Learning Disabilities', type: 'select', options: ['none', 'yes', 'prefer_not_to_say', 'possibly'] },
    // Add more questions based on your user_profiles table structure
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, questions.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'select':
        return (
          <select name={question.name} value={formData[question.name] || ''} onChange={handleChange} required>
            <option value="">Select...</option>
            {question.options.map(option => (
              <option key={option} value={option}>{option.replace('_', ' ')}</option>
            ))}
          </select>
        );
      // Add more cases for different question types
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.questionnaire}>
      <div className={styles.questionCard}>
        <h3>{questions[currentStep].label}</h3>
        {renderQuestion(questions[currentStep])}
      </div>
      <div className={styles.navigation}>
        {currentStep > 0 && (
          <button type="button" onClick={prevStep} className={styles.navButton}>
            Previous
          </button>
        )}
        {currentStep < questions.length - 1 ? (
          <button type="button" onClick={nextStep} className={styles.navButton}>
            Next
          </button>
        ) : (
          <button type="submit" className={styles.submitButton}>
            {initialData ? 'Update Profile' : 'Create Profile'}
          </button>
        )}
      </div>
    </form>
  );
};

export default UserProfileQuestionnaire;