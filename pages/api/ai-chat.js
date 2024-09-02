import { authenticateToken } from '../../src/middleware/auth';
import { pool } from '../../src/db';
import { processMessage } from '../../src/utils/openai';

const processingRequests = new Map();
const requestCache = new Map();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { message, chatId, isFirstMessage } = req.body;
      const cacheKey = `${chatId}-${isFirstMessage ? 'first' : message}`;

      // Check cache for recent identical requests
      if (requestCache.has(cacheKey)) {
        return res.status(200).json(requestCache.get(cacheKey));
      }

      // Check if there's an ongoing request for this chat
      if (processingRequests.has(chatId)) {
        return res.status(429).json({ error: 'Request already in progress for this chat' });
      }

      // Mark this chat as processing
      processingRequests.set(chatId, true);

      // Check if the chat is an AI chat
      const chatResult = await pool.query('SELECT is_ai_chat FROM chats WHERE id = $1', [chatId]);
      if (chatResult.rows.length === 0 || !chatResult.rows[0].is_ai_chat) {
        processingRequests.delete(chatId);
        return res.status(400).json({ error: 'This is not an AI chat' });
      }

      // Fetch user profile
      let userProfile;
      try {
        userProfile = await fetchUserProfile(user.userId);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        processingRequests.delete(chatId);
        return res.status(404).json({ error: 'User not found' });
      }

      // Fetch chat history
      const chatHistory = await fetchChatHistory(chatId);

      // Process message only once
      const aiResponse = await processMessage(
        isFirstMessage ? '' : message,
        chatHistory,
        userProfile,
        isFirstMessage
      );

      if (!aiResponse || !aiResponse.content) {
        processingRequests.delete(chatId);
        return res.status(500).json({ error: 'Invalid AI response generated' });
      }

      // Store AI response
      const aiMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content, sent_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatId, null, aiResponse.content, new Date().toISOString()]
      );

      const storedAiMessage = {
        ...aiMessageResult.rows[0],
        sent_at: new Date(aiMessageResult.rows[0].sent_at).toISOString()
      };

      // Cache the response for a short time (e.g., 5 seconds)
      requestCache.set(cacheKey, { aiMessage: storedAiMessage });
      setTimeout(() => requestCache.delete(cacheKey), 5000);

      processingRequests.delete(chatId);
      res.status(200).json({
        aiMessage: storedAiMessage
      });
    } catch (error) {
      console.error('Error processing AI chat message:', error);
      processingRequests.delete(chatId);
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