import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { is_ai_chat } = req.body;

      const result = await pool.query(
        'INSERT INTO chats (is_ai_chat) VALUES ($1) RETURNING *',
        [is_ai_chat]
      );

      const newChat = result.rows[0];

      // Add the user as a participant in the chat
      await pool.query(
        'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
        [newChat.id, user.userId]
      );

      res.status(201).json(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT c.* FROM chats c JOIN chat_participants cp ON c.id = cp.chat_id WHERE cp.user_id = $1',
        [user.userId]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}