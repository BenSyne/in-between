import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { ai_enhancement_enabled } = req.body;

      const result = await pool.query(
        'INSERT INTO user_preferences (user_id, ai_enhancement_enabled) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET ai_enhancement_enabled = $2 RETURNING *',
        [user.userId, ai_enhancement_enabled]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}