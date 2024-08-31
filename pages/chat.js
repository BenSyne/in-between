import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatDashboard from '../components/ChatDashboard';

export default function Chat() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      if (!response.ok) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return <ChatDashboard />;
}