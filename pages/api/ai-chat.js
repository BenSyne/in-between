import { processMessage } from '../../src/utils/openai';
import { authenticateToken } from '../../src/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received AI chat request:', req.body);

      const token = req.headers.authorization?.split(' ')[1];
      const user = await authenticateToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { message, chatHistory } = req.body;

      console.log('Processing message with chat history:', { message, chatHistory });

      // Process the message using OpenAI, including chat history
      const processedContent = await processMessage(message, chatHistory);

      console.log('Processed content:', processedContent);

      const aiMessage = {
        id: Date.now(),
        sender_id: 'ai',
        recipient_id: user.userId,
        content: processedContent,
        sent_at: new Date().toISOString(),
      };

      console.log('Sending AI response:', aiMessage);

      res.status(200).json(aiMessage);
    } catch (error) {
      console.error('Error processing AI chat message:', error);
      res.status(500).json({ error: 'Error processing AI chat message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}