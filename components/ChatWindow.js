import React from 'react';
import styles from '../styles/ChatWindow.module.css';

const ChatWindow = ({ messages, currentUser }) => {
  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageList}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.sender_id === (currentUser?.id || 'user') ? styles.sent : styles.received
            }`}
          >
            <p>{message.content}</p>
            <small>{new Date(message.sent_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;