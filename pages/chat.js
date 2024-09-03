import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ChatDashboard from '../components/ChatDashboard';
import io from 'socket.io-client';

export default function ChatPage() {
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');

      if (!token || !userId || !username) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/users/profile', { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const userData = await response.json();
        setCurrentUser(userData);

        const socketInstance = io('http://localhost:5001', {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          auth: {
            token: token
          }
        });
        setSocket(socketInstance);
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        router.push('/login');
      }
    };

    checkAuth();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  if (!socket || !currentUser) {
    return <div>Loading...</div>;
  }

  return <ChatDashboard socket={socket} currentUser={currentUser} token={localStorage.getItem('token')} />;
}