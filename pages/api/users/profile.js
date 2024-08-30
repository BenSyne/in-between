import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  try {
    await authenticateToken(req, res);

    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT u.email, u.username, up.*
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `, [req.user.userId]);

      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        // If no profile is found, return the basic user data
        const userResult = await pool.query('SELECT email, username FROM users WHERE id = $1', [req.user.userId]);
        res.json(userResult.rows[0]);
      }
    } else if (req.method === 'PUT') {
      // Existing PUT logic
      const { username, email, ...profileData } = req.body;
      
      // Update user table
      await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3', [username, email, req.user.userId]);
      
      // Update or insert user_profile
      const columns = Object.keys(profileData);
      const values = Object.values(profileData);
      const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
      const query = `
        INSERT INTO user_profiles (user_id, ${columns.join(', ')})
        VALUES ($${columns.length + 1}, ${columns.map((_, index) => `$${index + 1}`).join(', ')})
        ON CONFLICT (user_id) DO UPDATE SET ${setClause}
        RETURNING *
      `;
      const result = await pool.query(query, [...values, req.user.userId]);
      
      res.json({ ...result.rows[0], username, email });
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