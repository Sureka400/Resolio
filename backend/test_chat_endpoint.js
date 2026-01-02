const axios = require('axios');

async function testChatEndpoint() {
  console.log('Testing /api/chat endpoint...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/chat', {
      message: 'What is the capital of France and what is its population?',
      role: 'student'
    });

    console.log('Response status:', response.status);
    console.log('AI Response:', response.data.response);
  } catch (error) {
    console.error('Error testing chat endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
      console.error('Ensure the backend server is running on port 3001');
    }
  }
}

testChatEndpoint();
