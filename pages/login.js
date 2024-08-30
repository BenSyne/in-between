import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Login attempt with email:', email); // Add this line

    try {
      console.log('Sending login request...'); // Add this line
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status); // Add this line

      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data); // Add this line
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token set in localStorage:', data.token);
          router.push('/chat');
        } else {
          setError('No token received from server');
        }
      } else {
        const errorData = await response.json();
        console.log('Login error data:', errorData); // Add this line
        setError(errorData.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Login</button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}