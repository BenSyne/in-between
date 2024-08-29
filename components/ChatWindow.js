import styles from '../styles/ChatWindow.module.css'

export default function ChatWindow({ messages, currentUser, selectedUser }) {
  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.userAvatar}>{selectedUser.username[0].toUpperCase()}</div>
        <h2>{selectedUser.username}</h2>
      </div>
      <div className={styles.messageList}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.sender_id === currentUser.id ? styles.sent : styles.received
            }`}
          >
            <p>{message.content}</p>
            <small>{new Date(message.sent_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}