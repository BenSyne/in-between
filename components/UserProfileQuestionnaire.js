import React, { useState, useEffect } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const UserProfileQuestionnaire = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setFormData(initialData || {});
  }, [initialData]);

  const questions = [
    { key: 'learning_style', label: 'What is your preferred learning style?', type: 'select', options: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'] },
    { key: 'learning_disabilities', label: 'Do you have any learning disabilities?', type: 'text' },
    {
      key: 'adhd',
      label: 'ADHD Status',
      type: 'select',
      options: [
        { value: 'not_tested', label: 'Not Tested' },
        { value: 'tested_positive', label: 'Tested Positive' },
        { value: 'tested_negative', label: 'Tested Negative' },
        { value: 'suspect_positive', label: 'Suspect Positive' },
      ],
    },
    {
      key: 'focus_issues',
      label: 'Do you have any focus issues?',
      type: 'select',
      options: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'topic_dependent', label: 'Depends on the topic' },
      ],
    },
    { key: 'reaction_to_failure', label: 'How do you typically react to failure?', type: 'select', options: ['Give up easily', 'Get frustrated but try again', 'See it as a learning opportunity', 'Become more determined'] },
    {
      key: 'attitude_towards_winning_losing',
      label: 'Attitude towards winning and losing',
      type: 'select',
      options: [
        { value: 'winning_important', label: 'Winning is important' },
        { value: 'focus_on_learning', label: 'Focus on learning' },
        { value: 'enjoy_competition', label: 'Enjoy competition' },
        { value: 'avoid_losing', label: 'Avoid losing' },
      ],
    },
    { key: 'emotional_intelligence_understanding', label: 'How would you rate your emotional intelligence understanding?', type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent'] },
    { key: 'emotional_intelligence_hours_spent', label: 'How many hours have you spent studying emotional intelligence?', type: 'number' },
    { key: 'core_values', label: 'What are your core values?', type: 'array' },
    { key: 'internal_motivators', label: 'What are your internal motivators?', type: 'array' },
    { key: 'external_motivators', label: 'What are your external motivators?', type: 'array' },
    { key: 'self_soothing_methods_healthy', label: 'What are your healthy self-soothing methods?', type: 'array' },
    { key: 'self_soothing_methods_unhealthy', label: 'What are your unhealthy self-soothing methods?', type: 'array' },
    { key: 'stress_management_positive', label: 'What are your positive stress management techniques?', type: 'array' },
    { key: 'stress_management_negative', label: 'What are your negative stress management techniques?', type: 'array' },
    { key: 'personal_identity', label: 'How would you describe your personal identity?', type: 'text' },
    { key: 'role_models', label: 'Who are your role models?', type: 'array' },
    { key: 'admirable_qualities', label: 'What qualities do you admire in others?', type: 'array' },
    { key: 'hobbies', label: 'What are your hobbies?', type: 'array' },
    { key: 'challenging_topics', label: 'What topics do you find challenging?', type: 'array' },
    { key: 'therapy_experience', label: 'What is your experience with therapy?', type: 'select', options: ['None', 'Some sessions', 'Regular therapy', 'Extensive therapy'] },
    { key: 'favorite_food', label: 'What is your favorite food?', type: 'text' },
    { key: 'favorite_food_reason', label: 'Why is this your favorite food?', type: 'text' },
    { key: 'conflict_resolution_approach', label: 'How do you approach conflict resolution?', type: 'select', options: ['Avoid conflict', 'Compromise', 'Collaborate', 'Compete', 'Accommodate'] },
    { key: 'unique_challenges', label: 'What unique challenges have you faced?', type: 'text' },
  ];

  const handleInputChange = (key, value) => {
    setFormData(prevData => ({ ...prevData, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  const autoFillFields = () => {
    const autoFilledData = {
      learning_style: 'Visual',
      learning_disabilities: 'None',
      adhd: 'not_tested',
      focus_issues: 'no',
      reaction_to_failure: 'See it as a learning opportunity',
      attitude_towards_winning_losing: 'focus_on_learning',
      emotional_intelligence_understanding: 'Good',
      emotional_intelligence_hours_spent: 50,
      core_values: ['Honesty', 'Compassion', 'Growth'],
      internal_motivators: ['Personal growth', 'Curiosity', 'Achievement'],
      external_motivators: ['Recognition', 'Financial stability'],
      self_soothing_methods_healthy: ['Deep breathing', 'Meditation', 'Exercise'],
      self_soothing_methods_unhealthy: ['Overeating', 'Procrastination'],
      stress_management_positive: ['Time management', 'Prioritization', 'Seeking support'],
      stress_management_negative: ['Avoidance', 'Overthinking'],
      personal_identity: 'Ambitious and empathetic individual',
      role_models: ['Michelle Obama', 'Elon Musk', 'Malala Yousafzai'],
      admirable_qualities: ['Resilience', 'Creativity', 'Empathy'],
      hobbies: ['Reading', 'Hiking', 'Photography'],
      challenging_topics: ['Advanced mathematics', 'Public speaking'],
      therapy_experience: 'Some sessions',
      favorite_food: 'Sushi',
      favorite_food_reason: 'It\'s a perfect blend of flavors and textures',
      conflict_resolution_approach: 'Collaborate',
      unique_challenges: 'Overcoming social anxiety and learning a new language',
    };
    setFormData(autoFilledData);
  };

  const renderInput = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[question.key] || ''}
            onChange={(e) => handleInputChange(question.key, e.target.value)}
            className={styles.input}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={formData[question.key] || ''}
            onChange={(e) => handleInputChange(question.key, parseInt(e.target.value))}
            className={styles.input}
          />
        );
      case 'boolean':
        return (
          <select
            value={formData[question.key] || ''}
            onChange={(e) => handleInputChange(question.key, e.target.value === 'true')}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'array':
        return (
          <textarea
            value={Array.isArray(formData[question.key]) ? formData[question.key].join(', ') : formData[question.key] || ''}
            onChange={(e) => handleInputChange(question.key, e.target.value.split(',').map(item => item.trim()))}
            className={styles.textarea}
          />
        );
      case 'select':
        return (
          <select
            value={formData[question.key] || ''}
            onChange={(e) => handleInputChange(question.key, e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            {question.options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <form onSubmit={handleSubmit} className={styles.questionnaire}>
      {questions.map((question) => (
        <div key={question.key} className={styles.questionContainer}>
          <label className={styles.label}>{question.label}</label>
          {renderInput(question)}
        </div>
      ))}
      <button type="submit" className={styles.submitButton}>Submit</button>
      <button type="button" onClick={autoFillFields} className={styles.autoFillButton}>Auto-Fill (For Testing)</button>
    </form>
  );
};

export default UserProfileQuestionnaire;