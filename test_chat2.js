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
      try {
        const json = JSON.parse(body);
        console.log('Q: ' + message);
        console.log('A: ' + json.response.substring(0, 150) + '...\n');
      } catch (e) {
        console.log(body);
      }
    });
  });

  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
}

console.log('=== Testing Enhanced AI Responses ===\n');
testChat('what is DNA?', 'student');
setTimeout(() => testChat('solve this algebra problem', 'student'), 500);
setTimeout(() => testChat('how do I write an essay?', 'student'), 1000);
setTimeout(() => testChat('assessment and grading', 'teacher'), 1500);
setTimeout(() => testChat('student motivation', 'teacher'), 2000);
