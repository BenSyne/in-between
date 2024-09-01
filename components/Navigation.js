import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '../utils/auth';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsLoggedIn(authStatus);
    };

    checkAuth();
  }, []);

  return (
    <nav>
      {isLoggedIn ? (
        <>
          <Link href="/profile">Profile</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/logout">Logout</Link>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}