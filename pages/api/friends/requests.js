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
        'SELECT f.id, u.id as sender_id, u.username as sender_username FROM friendships f JOIN users u ON f.user1_id = u.id WHERE f.user2_id = $1 AND f.status = \'pending\'',
        [user.userId]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { receiverId } = req.body;

      const result = await pool.query(
        'INSERT INTO friendships (user1_id, user2_id, status) VALUES ($1, $2, \'pending\') RETURNING *',
        [user.userId, receiverId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}