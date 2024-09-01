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
        `SELECT f.id, u.id as sender_id, u.username as sender_username 
         FROM friendships f 
         JOIN users u ON f.user1_id = u.id 
         WHERE f.user2_id = $1 AND f.status = 'pending'`,
        [user.userId]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching pending friend requests:', error);
      res.status(500).json({ error: 'Error fetching pending friend requests' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}