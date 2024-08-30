import { pool } from '../../src/db';

export default async function handler(req, res) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      res.status(200).json({ message: 'Database connection successful', time: result.rows[0].now });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}