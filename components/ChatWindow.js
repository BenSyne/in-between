import styles from '../styles/ChatWindow.module.css'

export default function ChatWindow({ messages, currentUser }) {
  return (
    <div className={styles.chatWindow}>
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
  )
}