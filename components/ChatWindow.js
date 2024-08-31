import React, { useEffect, useRef } from 'react';
import styles from '../styles/ChatWindow.module.css';

const ChatWindow = ({ messages = [], currentUser, isAITyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isUserMessage = (message) => {
    return message && message.sender_id !== null && message.sender_id !== 'ai';
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageList}>
        {messages.map((message, index) => {
          if (!message) return null; // Skip rendering if message is undefined
          return (
            <div
              key={index}
              className={`${styles.message} ${
                isUserMessage(message) ? styles.sent : styles.received
              }`}
            >
              <div className={styles.messageContent}>
                <p>{message.content || 'No content'}</p>
                <small>
                  {message.sent_at ? new Date(message.sent_at).toLocaleTimeString() : 'No timestamp'}
                </small>
              </div>
            </div>
          );
        })}
        {isAITyping && (
          <div className={`${styles.message} ${styles.received} ${styles.typing}`}>
            <div className={styles.messageContent}>
              <p>AI is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;