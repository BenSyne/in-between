import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  try {
    const user = await authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(`
      SELECT 
        f.id, 
        f.user1_id, 
        f.user2_id, 
        f.status,
        CASE 
          WHEN f.user1_id = $1 THEN u2.username
          ELSE u1.username
        END as friend_username,
        CASE 
          WHEN f.user1_id = $1 THEN 'outgoing'
          ELSE 'incoming'
        END as request_type
      FROM friendships f
      JOIN users u1 ON f.user1_id = u1.id
      JOIN users u2 ON f.user2_id = u2.id
      WHERE (f.user1_id = $1 OR f.user2_id = $1) 
        AND f.status = 'pending'
        AND f.user1_id != f.user2_id  -- Ensure user1_id and user2_id are different
    `, [user.userId]);

    console.log('User ID:', user.userId);
    console.log('Pending friendships:', result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching pending friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending friend requests' });
  }
}