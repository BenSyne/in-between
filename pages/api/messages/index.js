import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import { processMessage } from '../../../src/utils/openai';

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
      console.log('Received message:', { chat_id, content });

      // Check if the user is a participant in the chat
      const participantCheck = await pool.query(
        'SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
        [chat_id, user.userId]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a participant in this chat' });
      }

      // Insert the user's message
      const userMessageResult = await pool.query(
        'INSERT INTO messages (sender_id, chat_id, content) VALUES ($1, $2, $3) RETURNING *',
        [user.userId, chat_id, content]
      );
      console.log('User message stored:', userMessageResult.rows[0]);

      // Fetch chat history
      const chatHistoryResult = await pool.query(
        'SELECT * FROM messages WHERE chat_id = $1 ORDER BY sent_at ASC LIMIT 10',
        [chat_id]
      );
      console.log('Chat history fetched:', chatHistoryResult.rows.length, 'messages');

      // Generate AI response
      console.log('Generating AI response...');
      const aiResponse = await processMessage(content, chatHistoryResult.rows);
      console.log('AI response generated:', aiResponse);

      // Insert AI response
      const aiMessageResult = await pool.query(
        'INSERT INTO messages (sender_id, chat_id, content, is_ai_enhanced) VALUES ($1, $2, $3, $4) RETURNING *',
        [null, chat_id, aiResponse, true]
      );
      console.log('AI message stored:', aiMessageResult.rows[0]);

      // Return both user message and AI response
      res.status(201).json({
        userMessage: userMessageResult.rows[0],
        aiMessage: aiMessageResult.rows[0]
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}