import { pool } from '../../../../../src/db';
import { authenticateToken } from '../../../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.query;

      const result = await pool.query(
        'UPDATE friendships SET status = \'accepted\' WHERE id = $1 AND user2_id = $2 RETURNING *',
        [id, user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}