import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>AI-Enhanced Chat Application</title>
        <meta name="description" content="AI-powered chat application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to AI-Enhanced Chat
        </h1>

        <p className={styles.description}>
          Connect with others using our AI-powered communication platform
        </p>

        <div className={styles.grid}>
          <Link href="/login" className={styles.card}>
            <h2>Login &rarr;</h2>
            <p>Access your account and start chatting</p>
          </Link>

          <Link href="/register" className={styles.card}>
            <h2>Register &rarr;</h2>
            <p>Create a new account and join our community</p>
          </Link>
        </div>
      </main>
    </div>
  )
}