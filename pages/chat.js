import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatDashboard from '../components/ChatDashboard';

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/users/profile', { credentials: 'include' });
      if (!response.ok) {
        router.push('/login');
      }
    };

    checkAuth();
  }, []);

  return <ChatDashboard />;
}