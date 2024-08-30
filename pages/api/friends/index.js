import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    const result = await pool.query(
      'SELECT u.id, u.username FROM users u INNER JOIN friendships f ON (u.id = f.user1_id OR u.id = f.user2_id) WHERE (f.user1_id = $1 OR f.user2_id = $1) AND f.status = $2',
      [req.user.userId, 'accepted']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(error.status || 500).json({ error: error.message || 'Error fetching friends' });
  }
}