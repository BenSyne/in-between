import Link from 'next/link'
import styles from '../styles/Header.module.css'

const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/chat">Chat</Link></li>
          <li><Link href="/profile">Profile</Link></li>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/register">Register</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;