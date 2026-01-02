const axios = require('axios');
require('dotenv').config();

async function testHuggingFace() {
  const apiKey = process.env.HUGGINGFACE_API_KEY; // Use from .env
  const model = 'Qwen/Qwen2.5-7B-Instruct';
  const prompt = 'Explain what a black hole is in one sentence.';

  console.log(`Testing Hugging Face with model: ${model}`);
  
  try {
    const response = await axios.post(`https://router.huggingface.co/v1/chat/completions`, {
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    if (response.data.choices && response.data.choices[0]) {
      console.log('Generated text:', response.data.choices[0].message.content);
    }
  } catch (error) {
    console.error('Error testing Hugging Face:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testHuggingFace();
