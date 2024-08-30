import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

const Header = () => {
  const router = useRouter();
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href={isLoggedIn ? "/chat" : "/"} className={styles.logo}>
          In-Between
        </Link>
        <div className={styles.links}>
          {isLoggedIn ? (
            <>
              <Link href="/chat" className={router.pathname === '/chat' ? styles.active : ''}>
                Chat
              </Link>
              <Link href="/profile" className={router.pathname.startsWith('/profile') ? styles.active : ''}>
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