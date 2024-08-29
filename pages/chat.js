import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Chat.module.css'
import Header from '../components/Header'
import ChatDashboard from '../components/ChatDashboard'

export default function Chat() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      fetchUser(token)
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

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <Header />
      <ChatDashboard user={user} />
    </div>
  )
}