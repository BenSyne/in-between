import React, { useState, useEffect } from 'react';
import styles from '../styles/UserProfileQuestionnaire.module.css';

const questions = [
  {
    id: 1,
    question: "How do you prefer to learn best?",
    options: [
      "Visually (e.g., diagrams, reading, videos)",
      "Auditory (e.g., lectures, audiobooks, discussions)",
      "Kinesthetically (e.g., hands-on activities, building, moving)",
      "A combination of multiple methods"
    ],
    coachingPrompt: "This will help us present information to you and guide the way you learn."
  },
  {
    id: 2,
    question: "Do you have any learning disabilities or special educational needs?",
    options: [
      "No",
      "Yes",
      "Yes, but I'd prefer not to say",
      "Not that I am aware of, but possibly"
    ],
    coachingPrompt: "If we know this, we can better bring content that is more contextual for you."
  },
  {
    id: 3,
    question: "Have you been tested for ADHD?",
    options: [
      "No",
      "Yes",
      "Yes, but I don't agree",
      "No, but I think I may have it"
    ],
    coachingPrompt: "This is becoming more common, and there is a lot to know about this topic."
  },
  // Add more questions here...
];

const UserProfileQuestionnaire = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // Load saved answers from localStorage or API
    const savedAnswers = localStorage.getItem('userProfileAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    localStorage.setItem('userProfileAnswers', JSON.stringify(newAnswers));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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
    </div>
  );
};

export default UserProfileQuestionnaire;