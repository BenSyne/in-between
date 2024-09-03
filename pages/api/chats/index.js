import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      console.log('Fetching chats for user:', user.userId);
      const result = await pool.query(`
        SELECT c.*, 
          CASE 
            WHEN c.is_ai_chat THEN NULL 
            ELSE (
              SELECT u.username 
              FROM chat_participants cp
              JOIN users u ON cp.user_id = u.id
              WHERE cp.chat_id = c.id AND cp.user_id != $1
              LIMIT 1
            )
          END as friend_username,
          (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as message_count
        FROM chats c
        JOIN chat_participants cp ON c.id = cp.chat_id
        WHERE cp.user_id = $1
        ORDER BY c.updated_at DESC
      `, [user.userId]);

      console.log('Query result:', result.rows);
      const validChats = result.rows.filter(chat => chat.message_count > 0 || chat.is_ai_chat);
      console.log('Filtered chats:', validChats);
      res.status(200).json(validChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}