import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { term } = req.query;
      const result = await pool.query(
        'SELECT id, username FROM users WHERE username ILIKE $1 AND id != $2 LIMIT 10',
        [`%${term}%`, user.userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Error searching users' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}