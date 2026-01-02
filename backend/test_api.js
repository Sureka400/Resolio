const axios = require('axios');

async function testChat() {
  try {
    const response = await axios.post('http://localhost:3001/api/chat', {
      message: "Hello, can you help me with a study plan?",
      role: "student"
    });
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testChat();