import React from 'react';
import styles from '../styles/SuggestionsList.module.css';

const SuggestionsList = ({ suggestions }) => {
  return (
    <div className={styles.suggestionsList}>
      <h3>Suggestions</h3>
      {suggestions.length > 0 ? (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      ) : (
        <p>No suggestions available at the moment.</p>
      )}
    </div>
  );
};

export default SuggestionsList;