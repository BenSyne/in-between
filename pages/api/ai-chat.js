import { authenticateToken } from '../../src/middleware/auth';
import { pool } from '../../src/db';
import { processMessage } from '../../src/utils/openai';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { message, chatId, isFirstMessage } = req.body;

      // Check if the chat is an AI chat
      const chatResult = await pool.query('SELECT is_ai_chat FROM chats WHERE id = $1', [chatId]);
      if (chatResult.rows.length === 0 || !chatResult.rows[0].is_ai_chat) {
        return res.status(400).json({ error: 'This is not an AI chat' });
      }

      // Fetch user profile
      let userProfile;
      try {
        userProfile = await fetchUserProfile(user.userId);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(404).json({ error: 'User not found' });
      }

      // Fetch chat history
      const chatHistory = await fetchChatHistory(chatId);

      let aiResponse;
      try {
        if (isFirstMessage) {
          aiResponse = await processMessage('', chatHistory, userProfile, true);
        } else {
          const updatedChatHistory = [...chatHistory, { sender_id: user.userId, content: message }];
          aiResponse = await processMessage(message, updatedChatHistory, userProfile);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        return res.status(500).json({ error: 'Failed to generate AI response' });
      }

      if (!aiResponse || !aiResponse.content) {
        return res.status(500).json({ error: 'Invalid AI response generated' });
      }

      // Store AI response
      const aiMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content, sent_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, null, aiResponse.content, aiResponse.sent_at]
      );

      res.status(200).json({
        aiMessage: aiMessageResult.rows[0]
      });
    } catch (error) {
      console.error('Error processing AI chat message:', error);
      res.status(500).json({ error: 'Error processing AI chat message', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function fetchChatHistory(chatId) {
  const result = await pool.query(
    'SELECT * FROM messages WHERE chat_id = $1 ORDER BY sent_at ASC',
    [chatId]
  );
  return result.rows;
}

async function fetchUserProfile(userId) {
  const result = await pool.query(
    `SELECT u.username, up.* 
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = $1`,
    [userId]
  );
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  return result.rows[0];
}