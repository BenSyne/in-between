import jwt from 'jsonwebtoken';
import { pool } from '../db';

export async function authenticateToken(req) {
  try {
    const token = req.cookies.token;
    console.log('Authenticating token:', token ? 'Token present' : 'No token');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      console.log('No user found for token');
      return null;
    }

    console.log('User authenticated:', result.rows[0].id);
    return { userId: result.rows[0].id };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}