const axios = require('axios');
require('dotenv').config();

async function testGroqAPI() {
  console.log('Testing Groq API...');
  console.log('API Key:', process.env.GROQ_API_KEY ? 'Configured' : 'NOT configured');
  
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is 2+2?' }
      ],
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Groq API Success!');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.log('❌ Groq API Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data || error.message);
  }
}

testGroqAPI();
