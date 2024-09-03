import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import { io } from '../../../src/server.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Received friend add request');
    try {
      const user = await authenticateToken(req);
      if (!user) {
        console.log('Unauthorized access attempt');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { friendUsername } = req.body;
      if (!friendUsername) {
        return res.status(400).json({ error: 'Friend username is required' });
      }
      console.log('Adding friend:', friendUsername);

      if (friendUsername === user.username) {
        return res.status(400).json({ error: 'You cannot add yourself as a friend' });
      }

      // Check if the friend exists
      console.log('Checking if friend exists');
      const friendResult = await pool.query('SELECT id FROM users WHERE username = $1', [friendUsername]);
      if (friendResult.rows.length === 0) {
        console.log('Friend not found');
        return res.status(404).json({ error: 'User not found' });
      }

      const friendId = friendResult.rows[0].id;

      // Check if friendship already exists
      console.log('Checking if friendship exists');
      const existingFriendship = await pool.query(
        'SELECT * FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
        [user.userId, friendId]
      );

      if (existingFriendship.rows.length > 0) {
        const friendship = existingFriendship.rows[0];
        console.log('Friendship already exists:', friendship);
        if (friendship.status === 'accepted') {
          return res.status(400).json({ error: 'You are already friends with this user' });
        } else if (friendship.status === 'pending') {
          if (friendship.user1_id === user.userId) {
            return res.status(400).json({ error: 'You have already sent a friend request to this user' });
          } else {
            return res.status(400).json({ error: 'This user has already sent you a friend request' });
          }
        }
      }

      // Add new friendship
      console.log('Adding new friendship');
      const newFriendship = await pool.query(
        'INSERT INTO friendships (user1_id, user2_id, status) VALUES ($1, $2, $3) RETURNING *',
        [user.userId, friendId, 'pending']
      );

      console.log('Friend request sent successfully:', newFriendship.rows[0]);
      res.status(200).json({ 
        message: 'Friend request sent successfully',
        friendship: newFriendship.rows[0]
      });

      // Emit the new friend request event
      console.log('Attempting to emit newFriendRequest event');
      if (io) {
        console.log(`Emitting newFriendRequest event to user_${friendId}`);
        io.to(`user_${friendId}`).emit('newFriendRequest', {
          id: newFriendship.rows[0].id,
          user1_id: user.userId,
          user2_id: friendId,
          status: 'pending'
        });
        console.log('newFriendRequest event emitted');
      } else {
        console.error('Socket.io not initialized');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}