import React from 'react';
import styles from '../styles/UserList.module.css';
import { FaTrash, FaRobot, FaUser } from 'react-icons/fa';

const UserList = ({ chats, onSelectChat, onDeleteChat }) => {
  return (
    <div className={styles.userList}>
      {chats.map((chat) => (
        <div key={chat.id} className={styles.chatItem}>
          <button onClick={() => onSelectChat(chat)} className={styles.chatButton}>
            {chat.is_ai_chat ? <FaRobot className={styles.icon} /> : <FaUser className={styles.icon} />}
            <span className={styles.chatName}>
              {chat.is_ai_chat ? 'AI Chat' : chat.friend_username}
            </span>
          </button>
          <button onClick={() => onDeleteChat(chat)} className={styles.deleteButton} aria-label="Delete chat">
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserList;