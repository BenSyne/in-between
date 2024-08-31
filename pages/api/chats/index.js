import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import { processMessage } from '../../../src/utils/openai';

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
          // Fetch user profile
          const profileResult = await client.query(
            'SELECT * FROM user_profiles WHERE user_id = $1',
            [user.userId]
          );
          const userProfile = profileResult.rows[0] || {};

          // Generate initial AI message
          const initialPrompt = generateInitialPrompt(userProfile);
          const aiResponse = await processMessage(initialPrompt);

          await client.query(
            'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3)',
            [newChat.id, null, aiResponse]
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

    const client = await pool.connect();
    try {
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

      // Delete messages associated with the chat
      await client.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);

      // Delete chat participants
      await client.query('DELETE FROM chat_participants WHERE chat_id = $1', [chatId]);

      // Delete the chat
      await client.query('DELETE FROM chats WHERE id = $1', [chatId]);

      await client.query('COMMIT');
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Failed to delete chat' });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

function generateInitialPrompt(userProfile) {
  const profileInfo = Object.entries(userProfile)
    .filter(([key, value]) => value && key !== 'user_id')
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n');

  return `Here is the user's information:

${profileInfo}

Based on this information, please greet the user and start a conversation that is tailored to their profile. Be friendly, empathetic, and show that you understand their background and preferences.`;
}