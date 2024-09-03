import React, { useState, useEffect } from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import styles from '../styles/AIChat.module.css'

const AIChat = ({ chatId, onSendMessage, initialMessages, currentUser }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isAITyping, setIsAITyping] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);

  useEffect(() => {
    if (initialMessages.length === 0 && !isAITyping && !initialMessageSent) {
      handleFirstAIMessage();
    }
  }, [initialMessages, chatId, initialMessageSent]);

  const handleFirstAIMessage = async (retryCount = 0) => {
    if (isAITyping || initialMessageSent) return;
    setIsAITyping(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: '', isFirstMessage: true }),
      });
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (response.status === 429 && retryCount < 3) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => handleFirstAIMessage(retryCount + 1), (retryCount + 1) * 1000);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch first AI message: ${response.status} ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
      
      if (data.aiMessage && data.aiMessage.content && data.aiMessage.sent_at) {
        const aiMessage = {
          ...data.aiMessage,
          sent_at: new Date(data.aiMessage.sent_at).toISOString()
        };
        console.log('Processed AI message:', aiMessage);
        setMessages([aiMessage]);
        setInitialMessageSent(true);
      } else {
        throw new Error('Invalid AI message received');
      }
    } catch (error) {
      console.error('Error in handleFirstAIMessage:', error);
      setMessages([{ content: "I'm sorry, I'm having trouble connecting. Please try again later.", sender_id: null, sender_username: 'AI', sent_at: new Date().toISOString() }]);
      throw error; // Propagate the error to be caught in handleStartNewChat
    } finally {
      setIsAITyping(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!currentUser) {
      console.error('User not authenticated');
      setMessages(prevMessages => [...prevMessages, {
        content: "You are not authenticated. Please log in and try again.",
        sender_id: null,
        sender_username: 'System',
        sent_at: new Date().toISOString()
      }]);
      return;
    }

    const userMessage = { content, sender_id: currentUser.id, sender_username: currentUser.username, sent_at: new Date().toISOString() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsAITyping(true);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this line
        },
        body: JSON.stringify({ chatId, message: content, isFirstMessage: false }),
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }

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
      setMessages(prevMessages => [...prevMessages, {
        content: error.message || "An error occurred while sending the message.",
        sender_id: null,
        sender_username: 'System',
        sent_at: new Date().toISOString()
      }]);
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