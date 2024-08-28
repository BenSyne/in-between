import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { requestId } = req.body;
      
      // Start a transaction
      await pool.query('BEGIN');

      // Update the friend request status
      const updateResult = await pool.query(
        'UPDATE friend_requests SET status = $1 WHERE id = $2 AND receiver_id = $3 RETURNING sender_id',
        ['accepted', requestId, user.userId]
      );

      if (updateResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Friend request not found' });
      }

      const senderId = updateResult.rows[0].sender_id;

      // Add the friend relationship
      await pool.query(
        'INSERT INTO friends (user1_id, user2_id) VALUES ($1, $2)',
        [user.userId, senderId]
      );

      // Commit the transaction
      await pool.query('COMMIT');

      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error accepting friend request:', error);
      res.status(500).json({ error: 'Error accepting friend request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}