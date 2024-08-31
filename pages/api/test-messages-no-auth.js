import { query } from '../../src/db';
import { authenticateToken } from '../../src/middleware/auth';

export default async function handler(req, res) {
  const { chatId } = req.query;
  try {
    const user = await authenticateToken(req);
    console.log('User authenticated:', user ? 'Yes' : 'No');

    let result;
    if (user) {
      result = await query('SELECT * FROM messages WHERE chat_id = $1 AND (sender_id = $2 OR sender_id IS NULL) LIMIT 10', [chatId, user.userId]);
    } else {
      result = await query('SELECT * FROM messages WHERE chat_id = $1 LIMIT 10', [chatId]);
    }
    
    res.status(200).json({ message: 'Messages fetched successfully', messages: result.rows, authenticated: !!user });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message, stack: error.stack });
  }
}