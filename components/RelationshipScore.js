import React from 'react';
import styles from '../styles/RelationshipScore.module.css';

const RelationshipScore = ({ score }) => {
  return (
    <div className={styles.relationshipScore}>
      <h3>Relationship Score</h3>
      <p>{score ? `${score}%` : 'N/A'}</p>
    </div>
  );
};

export default RelationshipScore;