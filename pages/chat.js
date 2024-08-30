import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Chat.module.css'
import ChatDashboard from '../components/ChatDashboard'

export default function Chat() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        localStorage.removeItem('token')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (!user) {
    return null // This will prevent any flash of content before redirecting
  }

  return (
    <div className={styles.container}>
      <ChatDashboard user={user} />
    </div>
  )
}