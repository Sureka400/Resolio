const http = require('http');

function testChat(message, role) {
  const data = JSON.stringify({ message, role });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('\n=== Response ===');
      try {
        const json = JSON.parse(body);
        console.log('Response:', json.response);
      } catch (e) {
        console.log(body);
      }
    });
  });

  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
}

console.log('Testing AI Chat System...\n');
console.log('Test 1: Explain photosynthesis');
testChat('explain photosynthesis', 'student');

setTimeout(() => {
  console.log('\n\nTest 2: How to study for exam');
  testChat('how do I study for an exam?', 'student');
}, 2000);

setTimeout(() => {
  console.log('\n\nTest 3: Lesson planning tips');
  testChat('help with lesson planning', 'teacher');
}, 4000);

setTimeout(() => {
  console.log('\n\nTest 4: General greeting');
  testChat('hello', 'student');
}, 6000);
