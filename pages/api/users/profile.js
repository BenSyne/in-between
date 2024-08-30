import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  try {
    await authenticateToken(req, res);

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.userId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Profile not found' });
      }
    } else if (req.method === 'PUT') {
      // ... (existing PUT logic)
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in profile handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}