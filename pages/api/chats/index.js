import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT c.*, 
          CASE WHEN c.is_ai_chat THEN NULL ELSE u.username END as friend_username,
          (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count
        FROM chats c
        LEFT JOIN chat_participants cp ON c.id = cp.chat_id
        LEFT JOIN users u ON cp.user_id = u.id AND u.id != $1
        WHERE c.id IN (SELECT chat_id FROM chat_participants WHERE user_id = $1)
        ORDER BY c.updated_at DESC
      `, [user.userId]);

      const validChats = result.rows.filter(chat => chat.message_count > 0);
      console.log('Fetched chats:', validChats);
      res.status(200).json(validChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { is_ai_chat } = req.body;
      
      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Create a new chat
        const chatResult = await client.query(
          'INSERT INTO chats (is_ai_chat) VALUES ($1) RETURNING *',
          [is_ai_chat]
        );
        const newChat = chatResult.rows[0];

        // Add the user as a participant
        await client.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [newChat.id, user.userId]
        );

        // If it's an AI chat, add an initial message from the AI
        if (is_ai_chat) {
          await client.query(
            'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3)',
            [newChat.id, null, "Hello! How can I assist you today?"]
          );
        }

        await client.query('COMMIT');
        res.status(201).json(newChat);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      res.status(500).json({ error: 'Failed to create new chat' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}