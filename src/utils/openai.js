import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processMessage(message, chatHistory = [], userProfile = {}) {
  try {
    console.log('Processing message with OpenAI:', { message, chatHistory, userProfile });

    const systemMessage = generateSystemMessage(userProfile);

    const messages = [
      { role: "system", content: systemMessage },
      ...chatHistory.map(msg => ({
        role: msg.sender_id === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log('Sending messages to OpenAI:', messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    console.log('Received response from OpenAI:', completion.choices[0].message);

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error processing message with OpenAI:', error);
    return "I'm sorry, I couldn't process that message. Could you try again?";
  }
}

function generateSystemMessage(userProfile) {
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

  const userName = userProfile.username || 'the user';

  const profileInfo = Object.entries(userProfile)
    .filter(([key, value]) => value && key !== 'user_id' && key !== 'username')
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n');

  return `You are a helpful assistant. The current date is ${formattedDate}, and the time is ${formattedTime}.

You are talking to ${userName}. Here is some information about them:

${profileInfo}

Please use this information to tailor your responses and provide personalized assistance. Be empathetic, understanding, and considerate of ${userName}'s background and preferences. 

Important instructions:
1. Keep your responses short and concise, ideally 2-3 sentences.
2. Focus on one main point or idea in each response.
3. Use simple, clear language.
4. Avoid overwhelming ${userName} with too much information at once.
5. If a longer explanation is needed, break it into smaller, digestible parts and ask if ${userName} wants more details.
6. Always be aware of the current date and time when providing information or making suggestions.
7. Address ${userName} by their name occasionally to personalize the conversation.`;
}

export async function enhanceMessage(content, userProfile = {}) {
  try {
    const systemMessage = `You are a helpful assistant that enhances the tone and clarity of messages without changing their meaning. 
    User profile: ${JSON.stringify(userProfile)}. 
    Please tailor your enhancements based on the user's profile information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Enhance this message to make it sound nicer and more clear, but keep the original meaning: "${content}"` }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error enhancing message:', error);
    return content; // Return original content if enhancement fails
  }
}