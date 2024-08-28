import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import ChatWindow from '../components/ChatWindow'
import MessageInput from '../components/MessageInput'
import FriendList from '../components/FriendList'
import UserSearch from '../components/UserSearch'
import RelationshipScore from '../components/RelationshipScore'
import SuggestionsList from '../components/SuggestionsList'
import AIChat from '../components/AIChat'
import styles from '../styles/Chat.module.css'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [relationshipScore, setRelationshipScore] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [isAIChat, setIsAIChat] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      fetchUser(token)
      fetchUsers(token)
    }
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id)
      fetchRelationshipScore(selectedUser.id)
      fetchSuggestions(selectedUser.id)
    }
  }, [selectedUser])

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

  const fetchUsers = async (token) => {
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages/${userId}`, {
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

  const fetchRelationshipScore = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/relationships/${userId}/score`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const scoreData = await response.json()
        setRelationshipScore(scoreData.score)
      }
    } catch (error) {
      console.error('Error fetching relationship score:', error)
    }
  }

  const fetchSuggestions = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/relationships/${userId}/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const suggestionsData = await response.json()
        setSuggestions(suggestionsData)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const handleSendMessage = async (message) => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = isAIChat ? '/api/ai-chat' : '/api/messages'
      const body = isAIChat 
        ? { message, chatHistory: messages } 
        : { recipientId: selectedUser.id, content: message }

      console.log('Sending message:', body);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const newMessage = await response.json()
        console.log('Received response:', newMessage);
        setMessages(prevMessages => [newMessage, ...prevMessages])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleAddFriend = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      })
      if (response.ok) {
        alert('Friend request sent!')
        setShowSearch(false)
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  return (
    <Layout>
      <div className={styles.chatContainer}>
        <div className={styles.sidebar}>
          <FriendList onSelectFriend={setSelectedUser} />
          <button onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? 'Hide Search' : 'Search Users'}
          </button>
          {showSearch && <UserSearch onAddFriend={handleAddFriend} />}
          <button className={styles.aiChatButton} onClick={() => { setIsAIChat(true); setSelectedUser(null); }}>
            Chat with AI
          </button>
        </div>
        <div className={styles.chatMain}>
          {isAIChat ? (
            <AIChat onSendMessage={handleSendMessage} />
          ) : selectedUser ? (
            <>
              <h2>Chat with {selectedUser.username}</h2>
              <RelationshipScore score={relationshipScore} />
              <ChatWindow messages={messages} currentUser={user} />
              <MessageInput onSendMessage={handleSendMessage} />
              <SuggestionsList suggestions={suggestions} />
            </>
          ) : (
            <div className={styles.welcomeMessage}>
              <h2>Welcome to AI-Enhanced Chat</h2>
              <p>Select a friend from the list to start chatting, search for new friends, or try our AI chat feature!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}