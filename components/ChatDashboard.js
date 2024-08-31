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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
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
      // Immediately add the user's message to the UI
      const userMessage = {
        id: Date.now(), // Temporary ID
        sender_id: currentUser.id,
        content: content,
        sent_at: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Show AI is typing
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

      // Update messages with the actual user message from the server and the AI response
      setMessages(prevMessages => [
        ...prevMessages.filter(msg => msg.id !== userMessage.id), // Remove the temporary user message
        data.userMessage,
        data.aiMessage
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, you can show an error message to the user here
    } finally {
      setIsAITyping(false);
    }
  };

  const handleStartNewChat = async (isAIChat = false) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this line if you're using JWT
        },
        body: JSON.stringify({ is_ai_chat: isAIChat }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to start new chat');
      }

      const newChat = await response.json();
      setChats(prevChats => [newChat, ...prevChats]);
      setSelectedChat(newChat);
      setMessages([]); // Clear messages for the new chat
      if (isAIChat) {
        // Add the initial AI message
        setMessages([{ id: 'initial', sender_id: null, content: "Hello! How can I assist you today?", sent_at: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError('Failed to start new chat. Please try again.');
    }
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      const response = await fetch(`/api/chats?chatId=${chatToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      setChats(prevChats => prevChats.filter(chat => chat.id !== chatToDelete.id));
      if (selectedChat && selectedChat.id === chatToDelete.id) {
        setSelectedChat(null);
        setMessages([]);
      }
      setShowDeleteConfirmation(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat. Please try again.');
    }
  };

  const openDeleteConfirmation = (chat) => {
    setChatToDelete(chat);
    setShowDeleteConfirmation(true);
  };

  return (
    <div className={styles.chatDashboard}>
      <div className={styles.sidebar}>
        <button onClick={() => handleStartNewChat(true)} className={styles.newChatButton}>
          Start New AI Chat
        </button>
        <UserList 
          chats={chats} 
          onSelectChat={handleSelectChat} 
          onDeleteChat={openDeleteConfirmation}
        />
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
      {showDeleteConfirmation && (
        <div className={styles.deleteConfirmation}>
          <p>Are you sure you want to delete this chat?</p>
          <button onClick={handleDeleteChat}>Yes, delete</button>
          <button onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;