import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import FriendList from './FriendList'; // Add this import
import { refreshToken } from '../src/utils/auth';
import { isAuthenticated } from '../utils/auth';
import { useRouter } from 'next/router';

let getConfig;
if (typeof window === 'undefined') {
  getConfig = require('next/config').default;
} else {
  getConfig = () => ({ publicRuntimeConfig: { apiTimeout: 30000 } });
}

const ChatDashboard = () => {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        // Redirect to login page or show login modal
        router.push('/login');
      } else {
        fetchChats();
        fetchCurrentUser();
      }
    };
    checkAuth();
  }, [router]); // Add router to the dependency array

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched chats:', data); // Log the fetched chats
        // Filter out chats with no messages or invalid data
        const validChats = data.filter(chat => chat && chat.id);
        setChats(validChats);
      } else if (response.status === 401) {
        console.log('Token expired, attempting to refresh');
        const refreshed = await refreshToken();
        if (refreshed) {
          fetchChats(); // Retry after refreshing
        }
      } else {
        console.error('Error fetching chats:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        console.error('Error fetching current user:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchMessages = async (chatId, retries = 3) => {
    console.log(`Fetching messages for chat ${chatId}`);
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), publicRuntimeConfig.apiTimeout);

        console.log(`Sending request to /api/messages?chatId=${chatId}`);
        const response = await fetch(`/api/messages?chatId=${chatId}`, {
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`Fetch response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Raw response text: ${responseText}`);

        if (response.ok) {
          let data;
          try {
            data = JSON.parse(responseText);
            console.log(`Parsed data:`, data);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            console.log('Raw response:', responseText);
            throw new Error('Invalid JSON response');
          }
          console.log(`Received ${data.messages.length} messages for chat ${chatId}`);
          if (data.messages.length > 0) {
            console.log('First message:', JSON.stringify(data.messages[0], null, 2));
          } else {
            console.log('No messages found for this chat');
          }
          return data.messages;
        } else {
          console.error(`Error fetching messages: ${response.status} ${responseText}`);
          if (i === retries - 1) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
          }
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (error.name === 'AbortError') {
          console.log('Request was aborted due to timeout');
          if (i === retries - 1) return [];
        } else if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Failed to fetch messages after multiple attempts');
  };

  const handleSelectChat = async (chat) => {
    console.log(`Selecting chat: ${JSON.stringify(chat)}`);
    setSelectedChat(chat);
    setMessages([]);
    setError(null);
    try {
      const data = await fetchMessages(chat.id);
      console.log(`Received ${data.length} messages for chat ${chat.id}:`, JSON.stringify(data, null, 2));
      setMessages(data);
      if (data.length === 0) {
        setError('No messages found for this chat.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat) return;

    try {
      let response;
      if (selectedChat.is_ai_chat) {
        response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: content, chatId: selectedChat.id, chatHistory: messages }),
          credentials: 'include',
        });
      } else {
        response = await fetch(`/api/messages?chatId=${selectedChat.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
          credentials: 'include',
        });
      }

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prevMessages => [...prevMessages, 
          { sender_id: currentUser.id, content }, 
          { ...newMessage, sender_id: newMessage.sender_id === null ? 'ai' : newMessage.sender_id }
        ]);
      } else if (response.status === 401) {
        console.log('Token expired, attempting to refresh');
        const refreshed = await refreshToken();
        if (refreshed) {
          handleSendMessage(content); // Retry after refreshing
        } else {
          router.push('/login'); // Redirect to login if refresh fails
        }
      } else {
        console.error('Error sending message:', await response.text());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartNewChat = async (isAIChat, friendId = null) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_ai_chat: isAIChat, friend_id: friendId }),
        credentials: 'include',
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        if (!refreshed) {
          // If refresh failed, redirect to login
          router.push('/login');
          return;
        }

        // Retry the request
        const retryResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_ai_chat: isAIChat, friend_id: friendId }),
          credentials: 'include',
        });

        if (retryResponse.ok) {
          const newChat = await retryResponse.json();
          setChats([...chats, newChat]);
          setSelectedChat(newChat);
          setMessages([]);
        } else {
          console.error('Error starting new chat:', await retryResponse.text());
        }
      } else if (response.ok) {
        const newChat = await response.json();
        setChats([...chats, newChat]);
        setSelectedChat(newChat);
        setMessages([]);
      } else {
        console.error('Error starting new chat:', await response.text());
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  return (
    <div className={styles.chatDashboard}>
      <div className={styles.sidebar}>
        <button onClick={() => handleStartNewChat(true)} className={styles.newChatButton}>
          Start New AI Chat
        </button>
        <FriendList onSelectFriend={(friendId) => handleStartNewChat(false, friendId)} />
        <UserList chats={chats} onSelectChat={handleSelectChat} />
      </div>
      <div className={styles.chatArea}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {selectedChat ? (
          <>
            <ChatWindow 
              messages={messages || []} 
              currentUser={currentUser || {}} 
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