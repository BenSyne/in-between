import LoginForm from '../components/LoginForm';
import styles from '../styles/Auth.module.css';

export default function Login() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <LoginForm />
    </div>
  );
}