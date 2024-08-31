import { query } from '../../src/db';

export default async function handler(req, res) {
  try {
    const result = await query('SELECT * FROM messages LIMIT 10');
    res.status(200).json({ message: 'Messages fetched successfully', messages: result.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message, stack: error.stack });
  }
}