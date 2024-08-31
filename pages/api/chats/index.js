import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { is_ai_chat, friend_id } = req.body;

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

      // If it's not an AI chat and a friend_id is provided, add the friend as a participant
      if (!is_ai_chat && friend_id) {
        await pool.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [newChat.id, friend_id]
        );

        // Fetch the friend's username
        const friendResult = await pool.query('SELECT username FROM users WHERE id = $1', [friend_id]);
        newChat.friend_username = friendResult.rows[0]?.username;
      }

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

      const result = await pool.query(`
        SELECT c.*, 
          CASE WHEN c.is_ai_chat THEN NULL ELSE u.username END as friend_username
        FROM chats c
        LEFT JOIN chat_participants cp ON c.id = cp.chat_id
        LEFT JOIN users u ON cp.user_id = u.id AND u.id != $1
        WHERE c.id IN (SELECT chat_id FROM chat_participants WHERE user_id = $1)
        ORDER BY c.updated_at DESC
      `, [user.userId]);

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}