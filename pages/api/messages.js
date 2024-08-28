import { pool } from '../../src/db';
import { authenticateToken } from '../../src/middleware/auth';
import { processMessage } from '../../src/utils/openai';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { recipientId, content } = req.body;

      // Process the message using OpenAI
      const processedContent = await processMessage(content);

      const result = await pool.query(
        'INSERT INTO messages (sender_id, recipient_id, original_content, processed_content) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.userId, recipientId, content, processedContent]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Error sending message' });
    }
  } else if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        'SELECT * FROM messages WHERE sender_id = $1 OR recipient_id = $1 ORDER BY sent_at DESC',
        [user.userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}