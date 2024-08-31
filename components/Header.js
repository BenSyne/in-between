import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

const Header = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);

    // Check login status on route change
    router.events.on('routeChangeComplete', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      router.events.off('routeChangeComplete', checkLoginStatus);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          In-Between
        </Link>
        <div className={styles.links}>
          {isLoggedIn ? (
            <>
              <Link href="/chat" className={router.pathname === '/chat' ? styles.active : ''}>
                Chat
              </Link>
              <Link href="/profile" className={router.pathname === '/profile' ? styles.active : ''}>
                Profile
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={router.pathname === '/login' ? styles.active : ''}>
                Login
              </Link>
              <Link href="/register" className={router.pathname === '/register' ? styles.active : ''}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;