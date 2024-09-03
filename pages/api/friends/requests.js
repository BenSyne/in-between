import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import { io } from '../../../src/server.js';

export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
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
      const { receiverId } = req.body;
      
      // Check if friendship already exists
      const existingFriendship = await pool.query(
        'SELECT * FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
        [user.userId, receiverId]
      );

      if (existingFriendship.rows.length > 0) {
        return res.status(400).json({ error: 'Friendship already exists or request already sent' });
      }

      const result = await pool.query(
        'INSERT INTO friendships (user1_id, user2_id, status) VALUES ($1, $2, \'pending\') RETURNING *',
        [user.userId, receiverId]
      );

      res.status(201).json(result.rows[0]);

      // Emit the new friend request event
      if (io) {
        io.to(`user_${receiverId}`).emit('newFriendRequest', {
          id: result.rows[0].id,
          user1_id: user.userId,
          user2_id: receiverId,
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}