import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import { io } from '../../../src/server.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { requestId } = req.body;
      
      const result = await pool.query(
        'UPDATE friendships SET status = \'accepted\' WHERE id = $1 AND user2_id = $2 RETURNING *',
        [requestId, user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      io.to(`user_${result.rows[0].user1_id}`).emit('friendRequestAccepted', { friendId: user.userId, username: user.username });
      io.to(`user_${user.userId}`).emit('friendRequestAccepted', { friendId: result.rows[0].user1_id, username: result.rows[0].username });

      res.status(200).json({ message: 'Friend request accepted' });

    } catch (error) {
      console.error('Error accepting friend request:', error);
      res.status(500).json({ error: 'Error accepting friend request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}