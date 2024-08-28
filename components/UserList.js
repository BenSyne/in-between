import React from 'react';
import styles from '../styles/UserList.module.css';

const UserList = ({ users, onSelectUser }) => {
  return (
    <div className={styles.userList}>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            <div className={styles.userAvatar}>{user.username[0].toUpperCase()}</div>
            <span>{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;