import OpenAI from 'openai';
import { authenticateToken } from '../../src/middleware/auth';

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

      const { message, chatHistory } = req.body;

      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...chatHistory.map(msg => ({
          role: msg.sender_id === 'ai' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview', // Changed to GPT-4 Turbo
        messages: messages,
      });

      const aiResponse = completion.choices[0].message.content;

      res.status(200).json({ content: aiResponse });
    } catch (error) {
      console.error('Error processing AI chat message:', error);
      res.status(500).json({ error: 'Error processing AI chat message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}