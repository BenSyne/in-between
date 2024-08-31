import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/NavBar.module.css';
import { isAuthenticated } from '../utils/auth';

const NavBar = () => {
  const [auth, setAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setAuth(authStatus);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setAuth(false);
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" legacyBehavior>
        <a className={styles.logo}>InBetween</a>
      </Link>
      <div className={styles.navLinks}>
        {auth ? (
          <>
            <Link href="/chat" legacyBehavior>
              <a className={styles.navLink}>Chat</a>
            </Link>
            <Link href="/profile" legacyBehavior>
              <a className={styles.navLink}>Profile</a>
            </Link>
            <button onClick={handleLogout} className={styles.navLink}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" legacyBehavior>
              <a className={styles.navLink}>Login</a>
            </Link>
            <Link href="/register" legacyBehavior>
              <a className={styles.navLink}>Register</a>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;