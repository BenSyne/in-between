import { pool } from '../../../../src/db';
import { authenticateToken } from '../../../../src/middleware/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const user = await authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [id]
      );
      res.status(200).json(result.rows);
    } else if (req.method === 'POST') {
      const { content } = req.body;
      const result = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
        [id, user.userId, content]
      );
      res.status(201).json(result.rows[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}