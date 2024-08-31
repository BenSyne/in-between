import { pool } from '../../src/db';
import { authenticateToken } from '../../src/middleware/auth';
import { enhanceMessage } from '../../src/utils/ai';

export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { chatId } = req.query;
    try {
      console.log(`Fetching messages for chat ${chatId}`);
      const startTime = Date.now();
      const result = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY sent_at ASC', [chatId]);
      const endTime = Date.now();
      console.log(`Query executed in ${endTime - startTime}ms`);
      console.log(`Found ${result.rows.length} messages`);
      res.status(200).json({ message: 'Messages fetched successfully', messages: result.rows });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { chat_id, content } = req.body;

      // Check if the user is a participant in the chat
      const participantCheck = await pool.query(
        'SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
        [chat_id, user.userId]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a participant in this chat' });
      }

      // Check if AI enhancement is enabled for the recipient
      const recipientPreference = await pool.query(
        'SELECT ai_enhancement_enabled FROM user_preferences WHERE user_id = (SELECT user_id FROM chat_participants WHERE chat_id = $1 AND user_id != $2)',
        [chat_id, user.userId]
      );

      let enhancedContent = content;
      let isAiEnhanced = false;

      if (recipientPreference.rows[0]?.ai_enhancement_enabled) {
        enhancedContent = await enhanceMessage(content);
        isAiEnhanced = true;
      }

      const result = await pool.query(
        'INSERT INTO messages (sender_id, chat_id, content, original_content, is_ai_enhanced) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.userId, chat_id, enhancedContent, content, isAiEnhanced]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}