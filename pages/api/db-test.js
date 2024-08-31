import { query } from '../../src/db';

export default async function handler(req, res) {
  try {
    const result = await query('SELECT NOW()');
    res.status(200).json({ message: 'Database connection successful', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message, stack: error.stack });
  }
}