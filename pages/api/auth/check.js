import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  try {
    const user = await authenticateToken(req);
    if (user) {
      res.status(200).json({ authenticated: true, user });
    } else {
      res.status(401).json({ authenticated: false });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}