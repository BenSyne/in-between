import { authenticateToken } from '../../../src/middleware/auth';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        console.error('JWT_SECRET or REFRESH_TOKEN_SECRET is not set');
        return res.status(500).json({ error: 'Internal server error' });
      }

      const newToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({ userId: user.userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      res.setHeader('Set-Cookie', [
        `token=${newToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
        `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
      ]);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}