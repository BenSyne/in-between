import React, { useState, useEffect } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const questions = [
  {
    id: 'learning_style',
    question: "How do you prefer to learn best?",
    options: [
      "visual",
      "auditory",
      "kinesthetic",
      "combination"
    ],
    coachingPrompt: "This will help us present information to you and guide the way you learn."
  },
  {
    id: 'learning_disabilities',
    question: "Do you have any learning disabilities or special educational needs?",
    options: [
      "none",
      "yes",
      "prefer_not_to_say",
      "possibly"
    ],
    coachingPrompt: "If we know this, we can better bring content that is more contextual for you."
  },
  {
    id: 'adhd',
    question: "Have you been tested for ADHD?",
    options: [
      "not_tested",
      "tested_positive",
      "tested_negative",
      "suspect_positive"
    ],
    coachingPrompt: "This is becoming more common, and there is a lot to know about this topic."
  },
  {
    id: 'focus_issues',
    question: "Do you have problems focusing?",
    options: [
      "no",
      "yes",
      "sometimes",
      "topic_dependent"
    ],
    coachingPrompt: "This will help us understand your focus patterns and provide appropriate support."
  },
  {
    id: 'reaction_to_failure',
    question: "How do you tend to react to failure?",
    options: [
      "learn_from_experience",
      "analyze_and_improve",
      "upset",
      "see_as_challenge"
    ],
    coachingPrompt: "Understanding your reaction to failure will help us tailor our approach to your needs."
  },
  {
    id: 'attitude_towards_winning_losing',
    question: "What is your common attitude towards winning or losing?",
    options: [
      "winning_important",
      "focus_on_learning",
      "enjoy_competition",
      "avoid_losing"
    ],
    coachingPrompt: "This will help us understand your perspective on competition and how it affects your learning."
  },
  {
    id: 'emotional_intelligence_understanding',
    question: "What is your understanding of emotional IQ?",
    options: [
      "low",
      "moderate",
      "high",
      "expert"
    ],
    coachingPrompt: "This will help us understand your emotional intelligence level and how it impacts your interactions."
  },
  {
    id: 'emotional_intelligence_hours_spent',
    question: "How many hours have you spent learning about emotional IQ?",
    options: [
      "0-5",
      "6-10",
      "11-20",
      "21+"
    ],
    coachingPrompt: "This will give us an idea of your commitment to emotional intelligence development."
  },
  {
    id: 'core_values',
    question: "What are the fundamental values and beliefs that your family holds dear, and how have they shaped your perspectives and actions?",
    options: [
      "family_values_1",
      "family_values_2",
      "family_values_3",
      "family_values_4"
    ],
    coachingPrompt: "Understanding your core values will help us tailor our approach to your needs."
  },
  {
    id: 'internal_motivators',
    question: "Which specific morals or values do you prioritize in your everyday actions and decisions, and why are they important to you?",
    options: [
      "internal_motivators_1",
      "internal_motivators_2",
      "internal_motivators_3",
      "internal_motivators_4"
    ],
    coachingPrompt: "This will help us understand your internal motivators and how they drive your actions."
  },
  {
    id: 'external_motivators',
    question: "What external rewards do you find most motivating? How do these motivators influence your goals and actions?",
    options: [
      "external_motivators_1",
      "external_motivators_2",
      "external_motivators_3",
      "external_motivators_4"
    ],
    coachingPrompt: "This will help us understand your external motivators and how they influence your goals."
  },
  {
    id: 'self_soothing_methods_healthy',
    question: "How do you self-soothe? (Consider both healthy and less healthy methods)",
    options: [
      "self_soothing_healthy_1",
      "self_soothing_healthy_2",
      "self_soothing_healthy_3",
      "self_soothing_healthy_4"
    ],
    coachingPrompt: "This will help us understand your self-soothing methods and how they impact your well-being."
  },
  {
    id: 'self_soothing_methods_unhealthy',
    question: "What unhealthy self-soothing methods do you use?",
    options: [
      "self_soothing_unhealthy_1",
      "self_soothing_unhealthy_2",
      "self_soothing_unhealthy_3",
      "self_soothing_unhealthy_4"
    ],
    coachingPrompt: "This will help us understand your unhealthy self-soothing methods and how they impact your well-being."
  },
  {
    id: 'stress_management_positive',
    question: "What actions do you take when you're stressed? (Both good and bad)",
    options: [
      "stress_management_positive_1",
      "stress_management_positive_2",
      "stress_management_positive_3",
      "stress_management_positive_4"
    ],
    coachingPrompt: "This will help us understand your stress management strategies and how they impact your well-being."
  },
  {
    id: 'stress_management_negative',
    question: "What unhealthy stress management methods do you use?",
    options: [
      "stress_management_negative_1",
      "stress_management_negative_2",
      "stress_management_negative_3",
      "stress_management_negative_4"
    ],
    coachingPrompt: "This will help us understand your unhealthy stress management methods and how they impact your well-being."
  },
  {
    id: 'personal_identity',
    question: "How would you describe your personal identity?",
    options: [
      "personal_identity_1",
      "personal_identity_2",
      "personal_identity_3",
      "personal_identity_4"
    ],
    coachingPrompt: "This will help us understand your personal identity and how it shapes your interactions."
  },
  {
    id: 'role_models',
    question: "Who do you admire most and why?",
    options: [
      "role_models_1",
      "role_models_2",
      "role_models_3",
      "role_models_4"
    ],
    coachingPrompt: "This will help us understand your role models and how they influence your perspectives."
  },
  {
    id: 'admirable_qualities',
    question: "What do you admire most about yourself and why?",
    options: [
      "admirable_qualities_1",
      "admirable_qualities_2",
      "admirable_qualities_3",
      "admirable_qualities_4"
    ],
    coachingPrompt: "This will help us understand your self-perception and how it impacts your interactions."
  },
  {
    id: 'hobbies',
    question: "What hobbies or interests do you enjoy engaging in during your free time?",
    options: [
      "hobbies_1",
      "hobbies_2",
      "hobbies_3",
      "hobbies_4"
    ],
    coachingPrompt: "This will help us understand your interests and how they enrich your life."
  },
  {
    id: 'challenging_topics',
    question: "Which superhero characters resonate with you, and what qualities or stories make them stand out to you?",
    options: [
      "challenging_topics_1",
      "challenging_topics_2",
      "challenging_topics_3",
      "challenging_topics_4"
    ],
    coachingPrompt: "This will help us understand your preferences and how they influence your interactions."
  },
  {
    id: 'therapy_experience',
    question: "Are there topics you find difficult to discuss? Without going into detail, could you indicate what types of topics these might be?",
    options: [
      "therapy_experience_1",
      "therapy_experience_2",
      "therapy_experience_3",
      "therapy_experience_4"
    ],
    coachingPrompt: "This will help us understand your communication preferences and how they impact your interactions."
  },
  {
    id: 'favorite_food',
    question: "What is your favorite food and why?",
    options: [
      "favorite_food_1",
      "favorite_food_2",
      "favorite_food_3",
      "favorite_food_4"
    ],
    coachingPrompt: "This will help us understand your preferences and how they influence your interactions."
  },
  {
    id: 'favorite_food_reason',
    question: "Why do you love this food so much?",
    options: [
      "favorite_food_reason_1",
      "favorite_food_reason_2",
      "favorite_food_reason_3",
      "favorite_food_reason_4"
    ],
    coachingPrompt: "This will help us understand your preferences and how they influence your interactions."
  },
  {
    id: 'conflict_resolution_approach',
    question: "How do you approach conflict resolution in your personal and professional relationships?",
    options: [
      "conflict_resolution_approach_1",
      "conflict_resolution_approach_2",
      "conflict_resolution_approach_3",
      "conflict_resolution_approach_4"
    ],
    coachingPrompt: "This will help us understand your approach to conflict resolution and how it impacts your interactions."
  },
  {
    id: 'unique_challenges',
    question: "What unique challenges or circumstances do you feel make your journey more difficult compared to others, and how do these impact your daily life and aspirations?",
    options: [
      "unique_challenges_1",
      "unique_challenges_2",
      "unique_challenges_3",
      "unique_challenges_4"
    ],
    coachingPrompt: "This will help us understand your unique challenges and how they impact your interactions."
  }
];

const UserProfileQuestionnaire = ({ onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const profileData = await response.json();
        setAnswers(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleAnswer = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, update the profile
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAnswers),
        });
        if (response.ok) {
          console.log('Profile updated successfully');
          setIsCompleted(true);
          if (onComplete) onComplete(newAnswers);
        } else {
          console.error('Error updating profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const autoCompleteQuestionnaire = async () => {
    const autoAnswers = {};
    questions.forEach(question => {
      autoAnswers[question.id] = question.options[Math.floor(Math.random() * question.options.length)];
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(autoAnswers),
      });
      if (response.ok) {
        console.log('Profile auto-completed successfully');
        setIsCompleted(true);
        if (onComplete) onComplete(autoAnswers);
      } else {
        console.error('Error auto-completing profile');
      }
    } catch (error) {
      console.error('Error auto-completing profile:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isCompleted) {
    return (
      <div className={styles.completion}>
        <h2>Thank you for completing the questionnaire!</h2>
        <p>Your profile has been updated with your responses.</p>
      </div>
    );
  }

  return (
    <div className={styles.questionnaire}>
      <h2>Customize Your AI Interaction</h2>
      <p>Answer these questions to help us personalize your experience:</p>
      
      <div className={styles.questionCard}>
        <h3>{currentQuestion.question}</h3>
        <p className={styles.coachingPrompt}>{currentQuestion.coachingPrompt}</p>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(currentQuestion.id, option)}
            className={answers[currentQuestion.id] === option ? styles.selectedOption : ''}
          >
            {option}
          </button>
        ))}
      </div>
      
      <div className={styles.progress}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      {/* Add the auto-complete button */}
      <button 
        className={styles.autoCompleteButton} 
        onClick={autoCompleteQuestionnaire}
      >
        Auto-Complete Questionnaire
      </button>
    </div>
  );
};

export default UserProfileQuestionnaire;