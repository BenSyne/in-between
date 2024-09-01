import { pool } from '../../../src/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ error: 'Internal server error' });
      }

      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
      console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not set');

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      let refreshToken;
      if (process.env.REFRESH_TOKEN_SECRET) {
        refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
      } else {
        console.warn('REFRESH_TOKEN_SECRET is not set. Refresh functionality will be disabled.');
      }

      // Set HTTP-only cookies
      res.setHeader('Set-Cookie', [
        serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: 86400,
          path: '/'
        }),
        ...(refreshToken ? [
          serialize('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 604800,
            path: '/'
          })
        ] : [])
      ]);

      console.log('Tokens set in cookies');
      res.status(200).json({ success: true, message: 'Logged in successfully' });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}