import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const user = await authenticateToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

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

      // Filter out chats with no messages
      const validChats = result.rows.filter(chat => chat.message_count > 0);

      console.log('Fetched chats:', validChats); // Log the fetched chats

      res.status(200).json(validChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}