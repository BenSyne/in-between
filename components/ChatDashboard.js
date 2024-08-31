import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import { refreshToken } from '../src/utils/auth';
import { isAuthenticated } from '../utils/auth';
import { useRouter } from 'next/router';

const ChatDashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchChats();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else {
        throw new Error('Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats. Please try again.');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/profile', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        throw new Error('Failed to fetch current user');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to load user profile. Please try again.');
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat) return;

    try {
      setIsAITyping(true);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selectedChat.id, content }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Received response from server:', data);

      setMessages(prevMessages => [
        ...prevMessages,
        data.userMessage,
        data.aiMessage
      ]);
      setIsAITyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAITyping(false);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleStartNewChat = async (isAIChat = false) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_ai_chat: isAIChat }),
        credentials: 'include',
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prevChats => [newChat, ...prevChats]);
        setSelectedChat(newChat);
        setMessages([]);
      } else {
        throw new Error('Failed to start new chat');
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError('Failed to start new chat. Please try again.');
    }
  };

  return (
    <div className={styles.chatDashboard}>
      <div className={styles.sidebar}>
        <button onClick={() => handleStartNewChat(true)} className={styles.newChatButton}>
          Start New AI Chat
        </button>
        <UserList chats={chats} onSelectChat={handleSelectChat} />
      </div>
      <div className={styles.chatArea}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {selectedChat ? (
          <>
            <ChatWindow 
              messages={messages} 
              currentUser={currentUser} 
              isAITyping={isAITyping}
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className={styles.welcomeMessage}>
            <h2>Welcome to the Chat</h2>
            <p>Select a chat or start a new one to begin messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;