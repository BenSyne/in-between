import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = checkAuthentication();
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/chat');
    }
  }, [router]);

  return null; // or a loading spinner
}

function checkAuthentication() {
  // Check if running on the client-side
  if (typeof window !== 'undefined') {
    // Check for the presence of the token cookie
    return document.cookie.includes('token=');
  }
  return false;
}