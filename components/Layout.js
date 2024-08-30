import React from 'react';
import Head from 'next/head';
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>In-Between</title>
        <meta name="description" content="Connect and chat with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;