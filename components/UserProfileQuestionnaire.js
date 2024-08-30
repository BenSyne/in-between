import React, { useState } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const UserProfileQuestionnaire = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [currentStep, setCurrentStep] = useState(0);

  const multiChoiceQuestions = [
    { name: 'learning_style', label: 'Learning Style', type: 'select', options: ['visual', 'auditory', 'kinesthetic', 'combination'] },
    { name: 'learning_disabilities', label: 'Learning Disabilities', type: 'select', options: ['none', 'yes', 'prefer_not_to_say', 'possibly'] },
    { name: 'adhd', label: 'ADHD', type: 'select', options: ['not_tested', 'tested_positive', 'tested_negative', 'suspect_positive'] },
    { name: 'focus_issues', label: 'Focus Issues', type: 'select', options: ['no', 'yes', 'sometimes', 'topic_dependent'] },
    { name: 'reaction_to_failure', label: 'Reaction to Failure', type: 'select', options: ['learn_from_experience', 'analyze_and_improve', 'upset', 'see_as_challenge'] },
    { name: 'attitude_towards_winning_losing', label: 'Attitude Towards Winning/Losing', type: 'select', options: ['winning_important', 'focus_on_learning', 'enjoy_competition', 'avoid_losing'] },
    { name: 'therapy_experience', label: 'Therapy Experience', type: 'select', options: ['none', 'curious', 'positive', 'negative'] },
  ];

  const otherQuestions = [
    { name: 'emotional_intelligence_understanding', label: 'Emotional Intelligence Understanding', type: 'textarea' },
    { name: 'emotional_intelligence_hours_spent', label: 'Hours Spent on Emotional Intelligence', type: 'number' },
    { name: 'core_values', label: 'Core Values', type: 'text', isArray: true },
    { name: 'internal_motivators', label: 'Internal Motivators', type: 'text', isArray: true },
    { name: 'external_motivators', label: 'External Motivators', type: 'text', isArray: true },
    { name: 'self_soothing_methods_healthy', label: 'Healthy Self-Soothing Methods', type: 'text', isArray: true },
    { name: 'self_soothing_methods_unhealthy', label: 'Unhealthy Self-Soothing Methods', type: 'text', isArray: true },
    { name: 'stress_management_positive', label: 'Positive Stress Management', type: 'text', isArray: true },
    { name: 'stress_management_negative', label: 'Negative Stress Management', type: 'text', isArray: true },
    { name: 'personal_identity', label: 'Personal Identity', type: 'textarea' },
    { name: 'role_models', label: 'Role Models', type: 'text', isArray: true },
    { name: 'admirable_qualities', label: 'Admirable Qualities', type: 'text', isArray: true },
    { name: 'hobbies', label: 'Hobbies', type: 'text', isArray: true },
    { name: 'challenging_topics', label: 'Challenging Topics', type: 'text', isArray: true },
    { name: 'favorite_food', label: 'Favorite Food', type: 'text' },
    { name: 'favorite_food_reason', label: 'Reason for Favorite Food', type: 'textarea' },
    { name: 'conflict_resolution_approach', label: 'Conflict Resolution Approach', type: 'textarea' },
    { name: 'unique_challenges', label: 'Unique Challenges', type: 'textarea' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleArrayChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newArray = [...(prevData[name] || [])];
      newArray[index] = value;
      return { ...prevData, [name]: newArray };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, otherQuestions.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'select':
        return (
          <select name={question.name} value={formData[question.name] || ''} onChange={handleChange} className={styles.input}>
            <option value="">Select an option</option>
            {question.options.map(option => (
              <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            name={question.name}
            value={formData[question.name] || ''}
            onChange={handleChange}
            className={styles.textarea}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            name={question.name}
            value={formData[question.name] || ''}
            onChange={handleChange}
            className={styles.input}
          />
        );
      case 'text':
        if (question.isArray) {
          return (
            <div>
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  type="text"
                  value={(formData[question.name] || [])[index] || ''}
                  onChange={(e) => handleArrayChange(e, index)}
                  placeholder={`${question.label} ${index + 1}`}
                  className={styles.input}
                />
              ))}
            </div>
          );
        }
        return (
          <input
            type="text"
            name={question.name}
            value={formData[question.name] || ''}
            onChange={handleChange}
            className={styles.input}
          />
        );
      default:
        return null;
    }
  };

  const autofillTestData = () => {
    const testData = {
      learning_style: 'visual',
      learning_disabilities: 'none',
      adhd: 'not_tested',
      focus_issues: 'sometimes',
      reaction_to_failure: 'learn_from_experience',
      attitude_towards_winning_losing: 'focus_on_learning',
      therapy_experience: 'curious',
      emotional_intelligence_understanding: 'I have a good understanding of emotional intelligence.',
      emotional_intelligence_hours_spent: 10,
      core_values: ['Honesty', 'Compassion', 'Growth'],
      internal_motivators: ['Personal growth', 'Curiosity', 'Achievement'],
      external_motivators: ['Recognition', 'Rewards', 'Competition'],
      self_soothing_methods_healthy: ['Meditation', 'Exercise', 'Deep breathing'],
      self_soothing_methods_unhealthy: ['Overeating', 'Procrastination'],
      stress_management_positive: ['Time management', 'Prioritization', 'Seeking support'],
      stress_management_negative: ['Avoidance', 'Negative self-talk'],
      personal_identity: 'I am a curious and ambitious individual who values personal growth and learning.',
      role_models: ['Albert Einstein', 'Marie Curie', 'Nelson Mandela'],
      admirable_qualities: ['Perseverance', 'Creativity', 'Empathy'],
      hobbies: ['Reading', 'Hiking', 'Photography'],
      challenging_topics: ['Advanced mathematics', 'Quantum physics', 'Philosophy'],
      favorite_food: 'Sushi',
      favorite_food_reason: 'I love the combination of flavors and the artistry in its preparation.',
      conflict_resolution_approach: 'I try to listen actively, understand all perspectives, and find a compromise.',
      unique_challenges: 'Balancing my ambitious goals with maintaining a healthy work-life balance.'
    };

    setFormData(testData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.questionnaire}>
      <button type="button" onClick={autofillTestData} className={styles.autofillButton}>
        Autofill Test Data
      </button>
      {currentStep === 0 && (
        <div className={styles.multiChoiceSection}>
          <h2>Multiple Choice Questions</h2>
          {multiChoiceQuestions.map((question) => (
            <div key={question.name} className={styles.questionCard}>
              <h3>{question.label}</h3>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      )}
      {currentStep > 0 && (
        <div className={styles.questionCard}>
          <h3>{otherQuestions[currentStep - 1].label}</h3>
          {renderQuestion(otherQuestions[currentStep - 1])}
        </div>
      )}
      <div className={styles.navigation}>
        {currentStep > 0 && (
          <button type="button" onClick={prevStep} className={styles.navButton}>
            Previous
          </button>
        )}
        {currentStep < otherQuestions.length ? (
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