import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export async function enhanceMessage(content) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that enhances the tone and clarity of messages without changing their meaning."
        },
        {
          role: "user",
          content: `Enhance this message to make it sound nicer and more clear, but keep the original meaning: "${content}"`
        }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error enhancing message:', error);
    return content; // Return original content if enhancement fails
  }
}