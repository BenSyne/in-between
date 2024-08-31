import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processMessage(message, chatHistory = []) {
  try {
    console.log('Processing message with OpenAI:', { message, chatHistory });

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
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