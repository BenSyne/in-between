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
      const { username, email, ...profileData } = req.body;
      
      // Remove user_id from profileData if it exists
      const { user_id, ...cleanProfileData } = profileData;

      // Update user table
      await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3', [username, email, req.user.userId]);
      
      // Prepare data for upsert
      const columns = Object.keys(cleanProfileData);
      const values = Object.values(cleanProfileData).map(value => 
        Array.isArray(value) ? JSON.stringify(value) : value
      );
      
      // Generate placeholders for the query
      const placeholders = columns.map((_, index) => `$${index + 2}`).join(', ');
      const updateSet = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');
      
      const query = `
        INSERT INTO user_profiles (user_id, ${columns.join(', ')})
        VALUES ($1, ${placeholders})
        ON CONFLICT (user_id) 
        DO UPDATE SET ${updateSet}
        RETURNING *
      `;
      
      const result = await pool.query(query, [req.user.userId, ...values]);
      
      // Fetch the updated user data
      const updatedUserResult = await pool.query('SELECT username, email FROM users WHERE id = $1', [req.user.userId]);
      const updatedUser = updatedUserResult.rows[0];

      // Combine user data with profile data
      const combinedResult = {
        ...updatedUser,
        ...result.rows[0]
      };

      res.json(combinedResult);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in profile handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}