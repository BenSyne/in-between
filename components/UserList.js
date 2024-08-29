import React from 'react';
import styles from '../styles/UserList.module.css';

const UserList = ({ users, onSelectUser }) => {
  return (
    <div className={styles.userList}>
      <h2>Chats</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            <div className={styles.userAvatar}>{user.username[0].toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.username}</span>
              <span className={styles.lastMessage}>Last message preview...</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;