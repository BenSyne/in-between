import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import ChatWindow from '../components/ChatWindow'
import MessageInput from '../components/MessageInput'
import styles from '../styles/Chat.module.css'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      fetchUser(token)
      fetchMessages(token)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchMessages = async (token) => {
    try {
      const response = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (content) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <Layout>
      <div className={styles.chatContainer}>
        <ChatWindow messages={messages} currentUser={user} />
        <MessageInput onSendMessage={sendMessage} />
      </div>
    </Layout>
  )
}