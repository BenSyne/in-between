import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT u.id, u.username FROM users u JOIN friendships f ON (u.id = f.user1_id OR u.id = f.user2_id) WHERE (f.user1_id = $1 OR f.user2_id = $1) AND f.status = \'accepted\'',
        [user.userId]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}