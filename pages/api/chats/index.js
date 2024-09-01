import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      console.log('Fetching chats for user:', user.userId);
      const result = await pool.query(`
        SELECT c.*, 
          CASE 
            WHEN c.is_ai_chat THEN NULL 
            ELSE (
              SELECT u.username 
              FROM chat_participants cp
              JOIN users u ON cp.user_id = u.id
              WHERE cp.chat_id = c.id AND cp.user_id != $1
              LIMIT 1
            )
          END as friend_username,
          (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count
        FROM chats c
        JOIN chat_participants cp ON c.id = cp.chat_id
        WHERE cp.user_id = $1
        ORDER BY c.updated_at DESC
      `, [user.userId]);

      console.log('Query result:', result.rows);
      const validChats = result.rows.filter(chat => chat.message_count > 0 || chat.is_ai_chat);
      console.log('Filtered chats:', validChats);
      res.status(200).json(validChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { is_ai_chat, friend_id } = req.body;
      
      // Prevent users from starting a chat with themselves
      if (!is_ai_chat && friend_id === user.userId) {
        return res.status(400).json({ error: 'You cannot start a chat with yourself' });
      }

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

        if (!is_ai_chat && friend_id) {
          // Add the friend as a participant
          await client.query(
            'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
            [newChat.id, friend_id]
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
  } else if (req.method === 'DELETE') {
    const { chatId } = req.query;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    let client;
    try {
      console.log('Deleting chat:', chatId);

      // Start a transaction
      client = await pool.connect();
      await client.query('BEGIN');

      // Check if the user is a participant in the chat
      const participantCheck = await client.query(
        'SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
        [chatId, user.userId]
      );

      if (participantCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'You are not a participant in this chat' });
      }

      // Delete messages
      await client.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);

      // Delete chat participants
      await client.query('DELETE FROM chat_participants WHERE chat_id = $1', [chatId]);

      // Delete the chat
      await client.query('DELETE FROM chats WHERE id = $1', [chatId]);

      await client.query('COMMIT');
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Failed to delete chat', details: error.message });
    } finally {
      if (client) client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}