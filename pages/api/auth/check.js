import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const user = await authenticateToken(req);
      if (user) {
        res.status(200).json({ authenticated: true });
      } else {
        res.status(401).json({ authenticated: false });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}