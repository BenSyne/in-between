import React, { useState, useEffect } from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import styles from '../styles/AIChat.module.css'

const AIChat = ({ chatId, onSendMessage, initialMessages, currentUser }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isAITyping, setIsAITyping] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
    if (initialMessages.length === 0) {
      handleFirstAIMessage();
    }
  }, [initialMessages, chatId]);

  const handleFirstAIMessage = async () => {
    setIsAITyping(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: '', isFirstMessage: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch first AI message');
      }
      const data = await response.json();
      if (data.aiMessage && data.aiMessage.content) {
        setMessages([data.aiMessage]);
      } else {
        throw new Error('Invalid AI message received');
      }
    } catch (error) {
      console.error('Error fetching first AI message:', error);
      setMessages([{ content: "I'm sorry, I'm having trouble connecting. Please try again later.", sender_id: null, sender_username: 'AI', sent_at: new Date().toISOString() }]);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleSendMessage = async (content) => {
    const userMessage = { content, sender_id: currentUser.id, sender_username: currentUser.username, sent_at: new Date().toISOString() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsAITyping(true);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: content, isFirstMessage: false }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.aiMessage && data.aiMessage.content) {
        setMessages(prevMessages => [...prevMessages, data.aiMessage]);
      } else {
        console.error('Invalid AI message received:', data.aiMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsAITyping(false);
    }
  };

  return (
    <div className={styles.aiChat}>
      <h2>Chat with AI Assistant</h2>
      <ChatWindow 
        messages={messages} 
        currentUser={currentUser} 
        isAITyping={isAITyping}
        isAIChat={true}
        otherUser="AI"
      />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default AIChat