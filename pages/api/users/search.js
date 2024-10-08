import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { term } = req.query;
      if (!term) {
        return res.status(400).json({ error: 'Search term is required' });
      }

      const result = await pool.query(
        'SELECT id, username FROM users WHERE username ILIKE $1 AND id != $2 LIMIT 10',
        [`%${term}%`, user.userId]
      );

      console.log('Search results:', result.rows);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Error searching users' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}