import React, { useState } from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import styles from '../styles/AIChat.module.css'

const AIChat = ({ onSendMessage }) => {
  const [messages, setMessages] = useState([])

  const handleSendMessage = async (content) => {
    console.log('Sending user message:', content);

    const userMessage = {
      id: Date.now(),
      sender_id: 'user',
      content: content,
      sent_at: new Date().toISOString(),
    }
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    const aiResponse = await onSendMessage(content, messages)
    console.log('Received AI response:', aiResponse);

    if (aiResponse) {
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }
  }

  return (
    <div className={styles.aiChat}>
      <h2>Chat with AI Assistant</h2>
      <ChatWindow messages={messages} currentUser={{ id: 'user' }} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default AIChat