const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { 
    console.log('Response from Gemini API:');
    console.log(data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

const payload = JSON.stringify({ message: 'Hello, how are you?', role: 'student' });
req.write(payload);
req.end();
