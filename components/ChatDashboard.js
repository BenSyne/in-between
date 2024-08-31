import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import AIChat from './AIChat';

const ChatDashboard = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const response = await fetch(`/api/messages/${chat.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleStartNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ is_ai_chat: false }),
      });
      if (response.ok) {
        const newChat = await response.json();
        setChats([...chats, newChat]);
        setSelectedChat(newChat);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          chat_id: selectedChat.id,
          content: content,
        }),
      });
      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={styles.chatDashboard}>
      <div className={styles.sidebar}>
        <button onClick={handleStartNewChat} className={styles.newChatButton}>Start New Chat</button>
        <UserList chats={chats} onSelectChat={handleSelectChat} />
      </div>
      <div className={styles.chatArea}>
        {selectedChat ? (
          <>
            <ChatWindow messages={messages} currentUser={user} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className={styles.welcomeMessage}>
            <h2>Welcome to the chat app!</h2>
            <p>Select a chat or start a new one.</p>
          </div>
        )}
      </div>
      <div className={styles.aiChatArea}>
        <AIChat user={user} />
      </div>
    </div>
  );
};

export default ChatDashboard;