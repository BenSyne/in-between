import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import FriendManagement from './FriendManagement';
import AIChat from './AIChat';
import io from 'socket.io-client';

const ChatDashboard = ({ socket, currentUser, token }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);

  useEffect(() => {
    console.log('ChatDashboard mounted, currentUser:', currentUser);
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser]);

  const fetchInitialData = async () => {
    console.log('Fetching initial data...');
    try {
      const [chatsResponse, friendsResponse, pendingFriendsResponse] = await Promise.all([
        fetch('/api/chats', { 
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include' 
        }),
        fetch('/api/friends', { 
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include' 
        }),
        fetch('/api/friends/pending', { 
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include' 
        })
      ]);

      console.log('Chats response status:', chatsResponse.status);
      console.log('Friends response status:', friendsResponse.status);
      console.log('Pending friends response status:', pendingFriendsResponse.status);

      if (!chatsResponse.ok || !friendsResponse.ok || !pendingFriendsResponse.ok) {
        throw new Error('One or more API requests failed');
      }

      const [chatsData, friendsData, pendingFriendsData] = await Promise.all([
        chatsResponse.json(),
        friendsResponse.json(),
        pendingFriendsResponse.json()
      ]);

      console.log('Chats data:', chatsData);
      console.log('Friends data:', friendsData);
      console.log('Pending friends data:', pendingFriendsData);

      setChats(chatsData);
      setFriends(friendsData);
      setPendingFriends(pendingFriendsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data. Please refresh the page and try again.');
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      const isServerHealthy = await checkServerHealth();
      if (isServerHealthy) {
        socket.on('connect', () => {
          console.log('Socket connected successfully');
          if (currentUser) {
            console.log(`Emitting joinUser event for user ${currentUser.id}`);
            socket.emit('joinUser', currentUser.id);
          }
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socket.on('reconnect_failed', () => {
          console.error('Failed to reconnect to the server');
          setError('Failed to reconnect to the server. Please refresh the page.');
        });

        socket.on('newMessage', (message) => {
          setMessages(prevMessages => [...prevMessages, message]);
        });

        socket.on('newChat', (newChat) => {
          setChats(prevChats => [...prevChats, newChat]);
        });

        socket.on('newFriendRequest', (request) => {
          setPendingFriends(prevPending => [...prevPending, request]);
        });

        socket.on('friendRequestAccepted', (friendId) => {
          setFriends(prevFriends => [...prevFriends, friendId]);
          setPendingFriends(prevPending => prevPending.filter(req => req.id !== friendId));
        });
      } else {
        console.error('Server is not healthy, cannot initialize socket');
      }
    };

    setupSocket();

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const checkServerHealth = async () => {
    try {
      const response = await fetch('http://localhost:5001/health', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Server is healthy');
        return true;
      } else {
        console.error('Server health check failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Server health check failed:', error);
    }
    return false;
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

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat || !currentUser) {
      setError('Cannot send message. Please select a chat and ensure you are logged in.');
      return;
    }

    try {
      const newMessage = {
        chatId: selectedChat.id,
        content: content,
        senderId: currentUser.id,
      };

      socket.emit('sendMessage', newMessage);

      setMessages(prevMessages => [...prevMessages, {
        ...newMessage,
        sent_at: new Date().toISOString(),
        sender_username: currentUser.username,
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const updateAuthTokens = (newTokens) => {
    console.log('Updating auth tokens:', newTokens);
  };

  const handleStartNewChat = async (isAIChat, friendId = null) => {
    try {
      if (!currentUser) {
        setError('User not authenticated. Please log in.');
        return;
      }

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

      setIsAITyping(false);

      setError(null);

      if (isAIChat) {
        setSelectedChat({...newChat});
      }

      socket.emit('createChat', { userId: currentUser.id, friendId, isAIChat });
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
      console.log('Sending friend request for:', friendUsername);
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendUsername }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Friend added successfully');
        onFriendsUpdate(); // Use the prop function instead of fetching all data again
        setError(null);
      } else {
        console.error('Error adding friend:', data.error);
        setError(data.error || 'Failed to add friend');
        if (data.details) {
          console.error('Error details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      setError('An unexpected error occurred. Please try again later.');
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
          friends={friends.filter(friend => friend.id !== currentUser?.id)}
          onAddFriend={handleAddFriend}
          onStartChat={(friendId) => handleStartNewChat(false, friendId)}
          onFriendsUpdate={fetchInitialData}
          currentUser={currentUser}
          userProfile={userProfile}
          pendingFriends={pendingFriends}
          socket={socket}
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