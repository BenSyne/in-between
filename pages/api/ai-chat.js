import OpenAI from 'openai';
import { authenticateToken } from '../../src/middleware/auth';
import { pool } from '../../src/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { message, chatId, chatHistory } = req.body;

      // Store user message
      await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3)',
        [chatId, user.userId, message]
      );

      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...chatHistory.map(msg => ({
          role: msg.sender_id === 'ai' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: messages,
      });

      const aiResponse = completion.choices[0].message.content;

      // Store AI response
      const result = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
        [chatId, null, aiResponse]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error processing AI chat message:', error);
      res.status(500).json({ error: 'Error processing AI chat message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}