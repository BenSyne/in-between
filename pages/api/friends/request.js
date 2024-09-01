import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { receiverId } = req.body;
      await pool.query(
        'INSERT INTO friendships (user1_id, user2_id, status) VALUES ($1, $2, \'pending\')',
        [user.userId, receiverId]
      );

      res.status(201).json({ message: 'Friend request sent' });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Error sending friend request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}