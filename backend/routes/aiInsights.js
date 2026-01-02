const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.post('/generate', authenticate, async (req, res) => {
  try {
    const { context, type } = req.body; // type can be 'performance', 'learning-path', 'assessment'
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return res.status(500).json({ message: 'AI configuration error' });
    }

    let prompt = '';
    if (type === 'performance') {
      prompt = `Analyze the following student performance data and provide 3 actionable insights: ${JSON.stringify(context)}`;
    } else if (type === 'learning-path') {
      prompt = `Based on these interests and grades, suggest a personalized learning path with 5 steps: ${JSON.stringify(context)}`;
    } else {
      prompt = `Provide educational insights based on this context: ${JSON.stringify(context)}`;
    }

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert educational AI assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const text = response.data.choices[0].message.content.trim();

    res.json({ insight: text });
  } catch (error) {
    console.error('Groq AI Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate AI insights' });
  }
});

module.exports = router;
