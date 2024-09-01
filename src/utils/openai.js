import OpenAI from 'openai';
import { pool } from '../db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processMessage(message, chatHistory = [], userProfile = {}, isFirstMessage = false) {
  try {
    console.log('Processing message:', { message, isFirstMessage });
    console.log('Received userProfile in processMessage:', userProfile);
    
    const userName = userProfile.username || 'User';
    console.log('Username for message:', userName);

    let messages = [];

    if (isFirstMessage) {
      const systemMessage = generateSystemMessage(userProfile, isFirstMessage, userName);
      console.log('System message for first interaction:', systemMessage);
      messages = [
        { role: "system", content: systemMessage },
        { role: "user", content: "Start a new conversation" }
      ];
    } else {
      console.log('Chat history length:', chatHistory.length);
      messages = chatHistory.map(msg => ({
        role: msg.sender_id === null ? 'assistant' : 'user',
        content: msg.content
      }));
      messages.push({ role: "user", content: message });
    }

    console.log('Sending messages to OpenAI:', JSON.stringify(messages, null, 2));

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages: messages,
    });

    console.log('Received response from OpenAI');

    let aiResponse = completion.choices[0].message.content;

    console.log('AI response:', aiResponse);

    return {
      content: aiResponse,
      sender_id: null,
      sender_username: 'AI',
      sent_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing message with OpenAI:', error);
    throw error;
  }
}

function generateSystemMessage(userProfile, isFirstMessage, userName) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const profileInfo = userProfile ? Object.entries(userProfile)
    .filter(([key, value]) => value && key !== 'user_id' && key !== 'username')
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n')
    : 'No profile information available.';

  let systemMessage = `You are a helpful assistant. The current date is ${formattedDate}, and the time is ${formattedTime}.

You are talking to a user named ${userName}. Here is some information about them:

${profileInfo}

Please use this information to tailor your responses and provide personalized assistance. Be empathetic, understanding, and considerate of ${userName}'s background and preferences.

Important instructions:
1. Greet the user by name only in your first message of the conversation.
2. Keep your responses short and concise, ideally 2-3 sentences.
3. Focus on one main point or idea in each response.
4. Use simple, clear language.
5. Avoid overwhelming the user with too much information at once.
6. If a longer explanation is needed, break it into smaller, digestible parts and ask if the user wants more details.
7. Always be aware of the current date and time when providing information or making suggestions.
8. Tailor your conversation based on the day of the week and time of day, considering typical activities or moods associated with that time.
9. Use the user's profile information to personalize your responses and show understanding of their background, preferences, and challenges.`;

  if (isFirstMessage) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    systemMessage += `\n\nThis is the first message in the conversation. Your response should start with a greeting including "${userName}'s" name, then ask how their ${dayOfWeek} is going.`;
  }

  return systemMessage;
}

export async function enhanceMessage(content, userProfile = {}) {
  try {
    const systemMessage = `You are a helpful assistant that enhances the tone and clarity of messages without changing their meaning. 
    User profile: ${JSON.stringify(userProfile)}. 
    Please tailor your enhancements based on the user's profile information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Enhance this message to make it sound nicer and more clear, but keep the original meaning: "${content}"` }
      ],
      max_tokens: 2000
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error enhancing message:', error);
    return content; // Return original content if enhancement fails
  }
}