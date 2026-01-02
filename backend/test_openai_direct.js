const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAI() {
  console.log('Testing OpenAI API...');
  if (!process.env.OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY not found');
    return;
  }
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'What is 2+2?' }
      ],
      max_tokens: 10,
    });
    console.log('✅ OpenAI Success!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI Error:', error.message);
  }
}

testOpenAI();
