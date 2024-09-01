import { pool } from '../../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tables = ['users', 'chats', 'chat_participants', 'messages'];
      const results = {};

      for (const table of tables) {
        const result = await pool.query(`SELECT * FROM ${table} LIMIT 10`);
        results[table] = result.rows;
      }

      res.status(200).json({ message: 'Database contents', results });
    } catch (error) {
      console.error('Error fetching database contents:', error);
      res.status(500).json({ error: 'Failed to fetch database contents', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}