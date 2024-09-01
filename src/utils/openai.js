import OpenAI from 'openai';
import { pool } from '../db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processMessage(message, chatHistory = [], userData = {}) {
  console.log('Received userData in processMessage:', userData);
  console.log('user_id in userData:', userData.user_id);
  
  try {
    console.log('Processing message with OpenAI:', { message, chatHistory, userData });

    let profileData;
    let userName = 'User';

    if (userData.user_id) {
      console.log('Attempting to fetch user profile with user_id:', userData.user_id);
      profileData = await fetchUserProfile(userData.user_id);
      console.log('User profile data fetched:', profileData);
      userName = profileData.username || 'User';
    } else {
      console.warn('No user_id provided in userData, using default profile');
      profileData = { username: 'User' };
    }

    console.log('Username for message:', userName);

    const isFirstMessage = !chatHistory.some(msg => msg.sender_id !== null);
    console.log('Is this the first message?', isFirstMessage);

    const systemMessage = generateSystemMessage(profileData, isFirstMessage, userName);
    console.log('Final system message:', systemMessage);

    const messages = [
      { role: "system", content: systemMessage },
      ...chatHistory.map(msg => ({
        role: msg.sender_id === null ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log('Sending messages to OpenAI:', JSON.stringify(messages, null, 2));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    console.log('Received response from OpenAI:', completion.choices[0].message);

    let aiResponse = completion.choices[0].message.content;

    console.log('Original AI response:', aiResponse);
    console.log('Does the response include the username?', aiResponse.toLowerCase().includes(userName.toLowerCase()));

    console.log('Final AI response:', aiResponse);

    return aiResponse;
  } catch (error) {
    console.error('Error processing message with OpenAI:', error);
    return "I'm sorry, I couldn't process that message. Could you try again?";
  }
}

async function fetchUserProfile(userId) {
  try {
    console.log('Fetching user profile for user ID:', userId);
    
    if (!userId) {
      console.error('No user ID provided to fetchUserProfile');
      throw new Error('No user ID provided');
    }

    const result = await pool.query(
      `SELECT u.username, up.* 
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.error('No user found for ID:', userId);
      throw new Error('User profile not found');
    }

    const profileData = result.rows[0];
    console.log('Fetched user profile:', profileData);
    return profileData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return a default profile instead of null
    return {
      username: 'User',
      // Add other default profile fields as needed
    };
  }
}

function generateSystemMessage(profileData, isFirstMessage, userName) {
  console.log('Generating system message with profile data:', profileData);
  console.log('Username for system message:', userName);

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

  const profileInfo = profileData ? Object.entries(profileData)
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
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error enhancing message:', error);
    return content; // Return original content if enhancement fails
  }
}