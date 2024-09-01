import React, { useState, useEffect } from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import styles from '../styles/AIChat.module.css'

const AIChat = ({ chatId, onSendMessage, initialMessages, currentUser }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isAITyping, setIsAITyping] = useState(false);

  useEffect(() => {
    console.log('AIChat - initialMessages:', initialMessages);
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      // If there are no initial messages, trigger the first AI message
      handleFirstAIMessage();
    }
  }, [initialMessages]);

  const handleFirstAIMessage = async () => {
    setIsAITyping(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: '', isFirstMessage: true }),
      });
      const data = await response.json();
      if (data.aiMessage) {
        setMessages([data.aiMessage]);
      }
    } catch (error) {
      console.error('Error fetching first AI message:', error);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleSendMessage = async (content) => {
    const userMessage = { content, sender_id: currentUser.id, sender_username: currentUser.username };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsAITyping(true);
    
    try {
      console.log('AIChat - Sending message:', content);
      const response = await onSendMessage(content);
      console.log('AIChat - Received response:', response);
      
      if (response.aiMessage) {
        setMessages(prevMessages => [...prevMessages, response.aiMessage]);
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