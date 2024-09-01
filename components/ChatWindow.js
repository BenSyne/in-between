import React, { useEffect, useRef } from 'react';
import styles from '../styles/ChatWindow.module.css';

const ChatWindow = ({ messages, currentUser, isAITyping, isAIChat, otherUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('ChatWindow - currentUser:', currentUser);
    console.log('ChatWindow - messages:', messages);
    console.log('ChatWindow - otherUser:', otherUser);
  }, [currentUser, messages, otherUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const renderMessage = (message, index) => {
    const isCurrentUser = message.sender_id === currentUser?.id;
    const senderName = isCurrentUser ? currentUser?.username : (message.sender_username || (isAIChat && message.sender_id === null ? 'AI' : otherUser));

    return (
      <div key={message.id || `message-${index}`} className={`${styles.messageWrapper} ${isCurrentUser ? styles.currentUser : styles.otherUser}`}>
        <div className={styles.messageBubble}>
          <span className={styles.sender}>{senderName}</span>
          <p>{message.content}</p>
          <small>{new Date(message.sent_at).toLocaleTimeString()}</small>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.chatWindow}>
      {messages.map((message, index) => renderMessage(message, index))}
      {isAITyping && (
        <div className={`${styles.messageWrapper} ${styles.otherUser}`}>
          <div className={`${styles.messageBubble} ${styles.typing}`}>
            <span className={styles.sender}>AI</span>
            <p>Typing...</p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;