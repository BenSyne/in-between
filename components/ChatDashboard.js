import React, { useState, useEffect } from 'react';
import styles from '../styles/ChatDashboard.module.css';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';

const ChatDashboard = ({ user }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    setSelectedUser(selectedUser);
    // Fetch messages for the selected user
    try {
      const response = await fetch(`/api/messages/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching messages:', errorData.error);
        // You can add user-friendly error handling here, e.g., showing an error message to the user
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // You can add user-friendly error handling here, e.g., showing an error message to the user
    }
  };

  const handleSendMessage = async (content) => {
    // Implement send message logic here
    console.log('Sending message:', content);
  };

  return (
    <div className={styles.chatDashboard}>
      <div className={styles.sidebar}>
        <UserList users={friends} onSelectUser={handleSelectUser} />
      </div>
      <div className={styles.chatArea}>
        {selectedUser ? (
          <>
            <ChatWindow messages={messages} currentUser={user} selectedUser={selectedUser} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className={styles.welcomeMessage}>
            <h2>Welcome to the chat app!</h2>
            <p>Select a user to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;