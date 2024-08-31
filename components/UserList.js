import React from 'react';
import styles from '../styles/UserList.module.css';

const UserList = ({ chats, onSelectChat }) => {
  if (!chats || chats.length === 0) {
    return <div className={styles.noChats}>No chats available</div>;
  }

  return (
    <div className={styles.userList}>
      {chats.map((chat) => (
        <div key={chat.id} className={styles.chatItem} onClick={() => onSelectChat(chat)}>
          {chat.is_ai_chat ? 'AI Chat' : `Chat ${chat.id}`}
        </div>
      ))}
    </div>
  );
};

export default UserList;