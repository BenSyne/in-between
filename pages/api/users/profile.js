import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: 'http://localhost:3000',
  credentials: true,
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  console.log('API route hit: /api/users/profile');
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token:', token);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    authenticateToken(req, res, async () => {
      console.log('Token authenticated, user:', req.user);
      const result = await pool.query(
        'SELECT id, username, email, created_at, COALESCE(last_login, created_at) as last_login FROM users WHERE id = $1',
        [req.user.userId]
      );

      console.log('Query result:', result.rows);

      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
}