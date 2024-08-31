import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

const Header = () => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          In-Between
        </Link>
        <div className={styles.links}>
          <Link href="/chat" className={router.pathname === '/chat' ? styles.active : ''}>
            Chat
          </Link>
          <Link href="/profile" className={router.pathname === '/profile' ? styles.active : ''}>
            Profile
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;