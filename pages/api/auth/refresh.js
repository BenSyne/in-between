import { pool } from '../../../src/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        console.log('No refresh token found in cookies');
        return res.status(401).json({ error: 'Refresh token is required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const userId = decoded.userId;

      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        console.log('User not found for userId:', userId);
        return res.status(404).json({ error: 'User not found' });
      }

      const newToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      res.setHeader('Set-Cookie', [
        `token=${newToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`,
        `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
      ]);

      console.log('New tokens set in cookies');
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}