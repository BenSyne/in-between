import { query } from '../../../../src/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    console.log(`Fetching messages for chat ${id}`);
    const startTime = Date.now();
    const result = await query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY sent_at ASC', [id]);
    const endTime = Date.now();
    console.log(`Query executed in ${endTime - startTime}ms`);
    console.log(`Found ${result.rows.length} messages`);
    res.status(200).json({ message: 'Messages fetched successfully', messages: result.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message, stack: error.stack });
  }
}