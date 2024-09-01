import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import { processMessage } from '../../../src/utils/openai';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { chatId } = req.query;
    try {
      console.log(`Fetching messages for chat ${chatId}, user ${user.userId}`);
      const startTime = Date.now();
      const result = await pool.query(`
        SELECT m.*, u.username as sender_username
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = $1
        ORDER BY m.sent_at ASC
      `, [chatId]);
      const endTime = Date.now();
      console.log(`Query executed in ${endTime - startTime}ms`);
      console.log(`Found ${result.rows.length} messages`);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { chatId, content, userProfile, isAIChat } = req.body;
      console.log('Received message:', { chatId, content, userId: user.userId, userProfile, isAIChat });

      // Check if the user is a participant in the chat
      const participantCheck = await pool.query(
        'SELECT * FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
        [chatId, user.userId]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a participant in this chat' });
      }

      // Insert user message
      const userMessageResult = await pool.query(
        'INSERT INTO messages (sender_id, chat_id, content) VALUES ($1, $2, $3) RETURNING *',
        [user.userId, chatId, content]
      );
      console.log('User message stored:', userMessageResult.rows[0]);

      let aiMessageResult = null;
      if (isAIChat) {
        // Process the message with AI logic, including userProfile
        const aiResponse = await processMessage(content, [], userProfile);
        aiMessageResult = await pool.query(
          'INSERT INTO messages (sender_id, chat_id, content, sent_at) VALUES ($1, $2, $3, $4) RETURNING *',
          [null, chatId, aiResponse.content, aiResponse.sent_at]
        );
        console.log('AI message stored:', aiMessageResult.rows[0]);
      }

      // Generate new tokens
      const newToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({ userId: user.userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      // Set cookies and headers
      res.setHeader('Set-Cookie', [
        serialize('token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: 3600,
          path: '/'
        }),
        serialize('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: 604800,
          path: '/'
        })
      ]);
      res.setHeader('X-New-Token', newToken);
      res.setHeader('X-New-Refresh-Token', newRefreshToken);

      res.status(201).json({
        userMessage: userMessageResult.rows[0],
        aiMessage: aiMessageResult ? aiMessageResult.rows[0] : null
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}