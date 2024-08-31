import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import FriendList from './FriendList'; // Add this import
import { refreshToken } from '../src/utils/auth';

const ChatDashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchChats();
    fetchCurrentUser();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
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

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    // Fetch messages for the selected chat
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chats/${chat.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Error fetching messages:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
      } else {
        console.error('Error sending message:', response.statusText);
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
        {selectedChat ? (
          <>
            <ChatWindow messages={messages} currentUser={currentUser} />
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