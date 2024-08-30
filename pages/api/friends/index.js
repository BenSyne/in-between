import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Fetch friends logic here
      const result = await pool.query(
        'SELECT u.id, u.username FROM users u INNER JOIN friendships f ON (u.id = f.user1_id OR u.id = f.user2_id) WHERE (f.user1_id = $1 OR f.user2_id = $1) AND f.status = $2',
        [user.userId, 'accepted']
      );
      res.json(result.rows);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Error fetching friends' });
  }
}