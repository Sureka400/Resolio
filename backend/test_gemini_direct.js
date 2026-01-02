const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  console.log('Testing Gemini API...');
  if (!process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY not found');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('What is 2+2?');
    const response = await result.response;
    console.log('✅ Gemini Success!');
    console.log('Response:', response.text());
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
  }
}

testGemini();
