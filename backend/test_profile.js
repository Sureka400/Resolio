const axios = require('axios');

async function testProfile() {
  try {
    console.log('Logging in as student...');
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'student@resolio.com',
      password: 'student123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful, token obtained.');

    console.log('Testing student profile endpoint...');
    const profileRes = await axios.get('http://localhost:3001/api/students/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Profile Response:', JSON.stringify(profileRes.data, null, 2));
    
    if (profileRes.data.email === 'student@resolio.com') {
      console.log('✅ Student profile endpoint is working correctly!');
    } else {
      console.log('❌ Unexpected profile data returned.');
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testProfile();
