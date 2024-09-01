import { pool } from '../../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tables = ['users', 'chats', 'chat_participants', 'messages'];
      const results = {};

      for (const table of tables) {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        results[table] = result.rows[0].count;
      }

      res.status(200).json({ message: 'Database check completed', results });
    } catch (error) {
      console.error('Error checking database:', error);
      res.status(500).json({ error: 'Database check failed', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}