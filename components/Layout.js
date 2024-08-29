import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>In-Between</div>
        <Link href="/" className={`${styles.navLink} ${router.pathname === '/' ? styles.active : ''}`}>
          Home
        </Link>
        <Link href="/chat" className={`${styles.navLink} ${router.pathname === '/chat' ? styles.active : ''}`}>
          Chat
        </Link>
        <Link href="/profile-settings" className={`${styles.navLink} ${router.pathname === '/profile-settings' ? styles.active : ''}`}>
          Profile Settings
        </Link>
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;