import { pool } from '../../../src/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
      console.log('Querying database for user');
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [username]);
      console.log('Query result:', result.rows);
      
      if (result.rows.length === 0) {
        console.log('User not found');
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = result.rows[0];
      console.log('User found:', user.id);
      
      console.log('Comparing passwords');
      console.log('Stored hash:', user.password_hash);
      console.log('Provided password:', password);
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      console.log('Password match:', passwordMatch);

      if (!passwordMatch) {
        console.log('Password does not match');
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ error: 'Internal server error' });
      }

      console.log('Generating JWT token');
      const token = jwt.sign(
        { userId: user.id, username: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Login successful for user:', user.id);
      res.status(200).json({ token, userId: user.id, username: user.email });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}