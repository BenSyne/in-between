import { pool } from '../../src/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  try {
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    console.log('Database connection successful');
    try {
      console.log('Querying database for user...');
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log('Query result:', result.rows);
      const user = result.rows[0];

      console.log('User found:', user ? 'Yes' : 'No');
      if (user) {
        console.log('User ID:', user.id);
        console.log('Stored password hash:', user.password_hash);
      } else {
        console.log('User not found, returning 401');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('Comparing passwords...');
      console.log('Input password:', password);
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      console.log('Password match:', passwordMatch ? 'Yes' : 'No');

      if (passwordMatch) {
        console.log('Generating JWT...');
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        console.log('JWT generated successfully');
        res.status(200).json({ token, redirect: '/chat' });
      } else {
        console.log('Password does not match, returning 401');
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } finally {
      client.release();
      console.log('Database connection released');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}