import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processMessage(message, chatHistory = []) {
  try {
    console.log('Processing message with OpenAI:', { message, chatHistory });

    const messages = [
      { role: "system", content: "You are a helpful assistant that processes and enhances messages." },
      ...chatHistory.map(msg => ({
        role: msg.sender_id === 'user' ? 'user' : 'assistant',
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