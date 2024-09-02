import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import FriendManagement from './FriendManagement';
import AIChat from './AIChat';

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
      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log('ChatDashboard - currentUser:', currentUser);
    console.log('ChatDashboard - messages:', messages);
    console.log('ChatDashboard - selectedChat:', selectedChat);
  }, [currentUser, messages, selectedChat]);

  const fetchChats = async () => {
    try {
      console.log('Fetching chats...');
      const response = await fetch('/api/chats', { 
        method: 'GET',
        credentials: 'include' 
      });
      console.log('Fetch response:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched chats:', data);
        setChats(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching chats:', errorData);
        throw new Error(errorData.error || 'Failed to fetch chats');
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

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      console.log('Fetching messages for chat:', selectedChat.id);
      const response = await fetch(`/api/messages?chatId=${selectedChat.id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data);
        setMessages(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching messages:', errorData);
        throw new Error(errorData.error || 'Failed to fetch messages');
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
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: content,
          isAIChat: selectedChat.is_ai_chat,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Message sent, received data:', data);

      setMessages(prevMessages => [...prevMessages, data.userMessage]);

      if (selectedChat.is_ai_chat && data.aiMessage) {
        setIsAITyping(true);
        // Simulate AI typing delay
        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages, data.aiMessage]);
          setIsAITyping(false);
        }, 1000);
      }

      // Handle new tokens if they were generated
      if (data.newTokens) {
        // Update your client-side auth state with the new tokens
        // This depends on how you're managing auth state in your app
        updateAuthTokens(data.newTokens);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Add this function to update your auth state
  const updateAuthTokens = (newTokens) => {
    // Update your client-side auth state
    // This could involve storing the new tokens in localStorage, 
    // updating a global state, or whatever method you're using for auth
    console.log('Updating auth tokens:', newTokens);
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

      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }

      const newChat = await response.json();
      setChats(prevChats => [newChat, ...prevChats]);
      setSelectedChat(newChat);
      setMessages([]);

      // Reset the AI typing state
      setIsAITyping(false);

      // Clear any previous error
      setError(null);

      // If it's an AI chat, the AIChat component will handle the first message
      if (isAIChat) {
        // Trigger a re-render of AIChat component
        setSelectedChat({...newChat});
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

      if (response.ok) {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatToDelete.id));
        setSelectedChat(null);
        setShowDeleteConfirmation(false);
        setChatToDelete(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat. Please try again.');
    }
  };

  const openDeleteConfirmation = (chat) => {
    setChatToDelete(chat);
    setShowDeleteConfirmation(true);
  };

  const onSendMessage = async (content, chatId, chatHistory) => {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          chatId: chatId,
          chatHistory: chatHistory,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const sendUserMessage = async (content, chatId) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          chatId: chatId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending user message:', error);
      throw error;
    }
  };

  const handleAddFriend = async (friendUsername) => {
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendUsername }),
        credentials: 'include',
      });

      if (response.ok) {
        // Friend added successfully
        fetchFriends(); // Refresh the friends list
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add friend');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      setError('An error occurred while adding friend');
    }
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
          selectedChat.is_ai_chat ? (
            <AIChat
              key={selectedChat.id}
              chatId={selectedChat.id}
              onSendMessage={handleSendMessage}
              initialMessages={messages}
              currentUser={currentUser}
            />
          ) : (
            <>
              <ChatWindow 
                messages={messages} 
                currentUser={currentUser} 
                isAITyping={isAITyping}
                isAIChat={selectedChat.is_ai_chat}
                otherUser={selectedChat.is_ai_chat ? 'AI' : selectedChat.friend_username}
              />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          )
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
          onAddFriend={handleAddFriend}
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