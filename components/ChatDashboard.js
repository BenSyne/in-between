import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import FriendManagement from './FriendManagement';

const ChatDashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchChats();
    fetchCurrentUser();
    fetchUserProfile();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log('ChatDashboard - currentUser:', currentUser);
    console.log('ChatDashboard - messages:', messages);
    console.log('ChatDashboard - selectedChat:', selectedChat);
  }, [currentUser, messages, selectedChat]);

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
      } else if (response.status === 404) {
        console.error('User profile not found. Redirecting to login.');
        // Redirect to login page or show a message to the user
      } else {
        throw new Error('Failed to fetch current user');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to load user profile. Please try again.');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else if (response.status === 404) {
        console.error('User profile not found. Redirecting to profile creation.');
        // Redirect to profile creation page or show a message to the user
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends. Please try again.');
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat) return;

    try {
      const tempUserMessage = {
        id: Date.now(),
        sender_id: currentUser.id,
        sender_username: currentUser.username,
        content: content,
        sent_at: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, tempUserMessage]);

      setIsAITyping(selectedChat.is_ai_chat);

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

      if (selectedChat.is_ai_chat) {
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => msg.id !== tempUserMessage.id),
          data.userMessage,
          data.aiMessage
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => msg.id !== tempUserMessage.id),
          data.userMessage
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsAITyping(false);
    }
  };

  const handleStartNewChat = async (isAIChat = false, friendId = null) => {
    try {
      // Prevent starting a chat with oneself
      if (!isAIChat && friendId === currentUser.id) {
        setError("You can't start a chat with yourself.");
        return;
      }

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_ai_chat: isAIChat, friend_id: friendId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start new chat');
      }

      const newChat = await response.json();
      setChats(prevChats => [newChat, ...prevChats]);
      setSelectedChat(newChat);
      setMessages([]);
    } catch (error) {
      console.error('Error starting new chat:', error);
      setError(error.message || 'Failed to start new chat. Please try again.');
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
              isAIChat={selectedChat.is_ai_chat}
              otherUser={selectedChat.friend_username}
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
      <div className={styles.friendManagement}>
        <FriendManagement 
          friends={friends} 
          onStartChat={(friendId) => handleStartNewChat(false, friendId)}
          onFriendsUpdate={fetchFriends}
        />
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