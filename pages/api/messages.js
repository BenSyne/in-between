import { pool } from '../../src/db';
import { authenticateToken } from '../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT * FROM messages WHERE sender_id = $1 OR recipient_id = $1 ORDER BY sent_at DESC',
        [user.userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  } else if (req.method === 'POST') {
    // Implement message sending logic here
    res.status(501).json({ error: 'Not implemented' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}