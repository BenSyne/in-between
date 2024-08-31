import React, { useEffect } from 'react';
import styles from '../styles/ChatWindow.module.css';

const ChatWindow = ({ messages = [], currentUser }) => {
  useEffect(() => {
    console.log('ChatWindow received messages:', JSON.stringify(messages, null, 2));
  }, [messages]);

  if (!messages || messages.length === 0) {
    return <div className={styles.chatWindow}>No messages to display.</div>;
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageList}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.sender_type === 'user' ? styles.sent : 
              message.sender_type === 'ai' ? styles.ai :
              styles.received
            }`}
          >
            <p>{message.content}</p>
            <small>
              Sent at: {new Date(message.sent_at).toLocaleString()} | 
              Sender: {message.sender_type || 'Unknown'} | 
              AI Enhanced: {message.is_ai_enhanced ? 'Yes' : 'No'}
            </small>
            {message.original_content && (
              <small>Original content: {message.original_content}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;