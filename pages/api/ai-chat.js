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
      const userProfile = await fetchUserProfile(user.userId);

      let aiResponse;
      let userMessageResult = null;

      if (isFirstMessage) {
        // Generate the initial AI message
        aiResponse = await processMessage('', [], userProfile, true);
      } else {
        // Store user message
        userMessageResult = await pool.query(
          'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
          [chatId, user.userId, message]
        );

        // Fetch chat history
        const chatHistory = await fetchChatHistory(chatId);

        // Process the message with AI
        aiResponse = await processMessage(message, chatHistory, userProfile);
      }

      if (!aiResponse || !aiResponse.content) {
        throw new Error('Failed to generate AI response');
      }

      // Store AI response
      const aiMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content, sent_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, null, aiResponse.content, aiResponse.sent_at]
      );

      res.status(200).json({
        userMessage: isFirstMessage ? null : userMessageResult.rows[0],
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
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || {};
}