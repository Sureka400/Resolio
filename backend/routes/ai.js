const express = require('express');
const axios = require('axios');
const { authenticate, requireStudent } = require('../middleware/auth');
const StudentBehavior = require('../models/StudentBehavior');
const StudentProfile = require('../models/StudentProfile');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * @route GET /api/ai/insights/:studentId
 * @desc Get AI-generated supportive insights based on behavior
 * @access Private (Student only for privacy)
 */
router.get('/insights/:studentId', [authenticate, requireStudent], async (req, res) => {
  try {
    const { studentId } = req.params;

    // Privacy policy check
    if (req.user.id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Privacy policy: Detailed AI motivational insights are private to the student.' 
      });
    }

    let behavior = await StudentBehavior.findOne({ studentId });
    if (!behavior) {
      // If no behavior data exists, create a default one so the student gets a positive start
      behavior = new StudentBehavior({
        studentId,
        loginFrequency: 0,
        assignmentSubmission: 'onTime',
        timeSpentOnMaterials: 0,
        missedDeadlinesCount: 0,
        aiChatUsageCount: 0,
        timetableAdherence: 100
      });
      await behavior.save();
    }

    // Construct a non-judgmental prompt
    const prompt = `Based on this student data: ${behavior.loginFrequency} logins per week, ${behavior.assignmentSubmission} submissions, ${behavior.timeSpentOnMaterials} minutes spent on materials, ${behavior.missedDeadlinesCount} missed deadlines. Generate a supportive, non-judgmental motivational message. 
    Rules:
    - Tone: Empathetic and encouraging
    - No mental health diagnosis
    - No medical claims
    - Focus on study habits and motivation only
    Output:`;

    if (!GROQ_API_KEY || GROQ_API_KEY.includes('replace_with_your')) {
      throw new Error('Groq API key not configured');
    }

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a supportive educational AI coach.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    let insightMessage = "";
    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      insightMessage = response.data.choices[0].message.content.trim();
    } else {
      insightMessage = "You're making progress! Remember that every small step counts towards your goals. Let's try to focus on one task today.";
    }

    res.json({ 
      studentId,
      insight: insightMessage,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI Insights Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate AI insights', error: error.message });
  }
});

/**
 * @route POST /api/ai/generate
 * @desc Generic AI generation endpoint
 * @access Private
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { context, type } = req.body;
    
    if (!GROQ_API_KEY) {
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

    const insight = response.data.choices[0].message.content.trim();
    res.json({ insight });
  } catch (error) {
    console.error('AI Generation Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate AI insights' });
  }
});

/**
 * @route GET /api/ai/schedule/:studentId
 * @desc Generate a personalized study schedule
 * @access Private (Student only)
 */
router.get('/schedule/:studentId', [authenticate, requireStudent], async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const behavior = await StudentBehavior.findOne({ studentId });
    const profile = await StudentProfile.findOne({ studentId });
    const courses = await Course.find({ students: studentId });
    
    // Get upcoming assignments for these courses
    const assignments = await Assignment.find({
      course: { $in: courses.map(c => c._id) },
      dueDate: { $gte: new Date() },
      status: 'published'
    }).populate('course', 'title');

    const courseSchedules = courses.map(c => ({
      title: c.title,
      schedule: c.schedule
    }));

    const assignmentContext = assignments.map(a => ({
      title: a.title,
      course: a.course?.title,
      dueDate: a.dueDate,
      type: a.type
    }));

    const prompt = `Generate a highly personalized daily study schedule for a student based on their real data:
    
    1. Behavioral Data:
    - Login Frequency: ${behavior ? behavior.loginFrequency : 0} times/week
    - Assignment Submission Style: ${behavior ? behavior.assignmentSubmission : 'unknown'}
    - Time Spent on Materials: ${behavior ? behavior.timeSpentOnMaterials : 0} minutes
    - Missed Deadlines Count: ${behavior ? behavior.missedDeadlinesCount : 0}
    - Timetable Adherence: ${behavior ? behavior.timetableAdherence : 100}%
    
    2. Student Profile:
    - Engagement Level: ${profile ? profile.engagementLevel : 'medium'}
    - Consistency Level: ${profile ? profile.consistencyLevel : 'medium'}
    - Stress Risk: ${profile ? profile.stressRisk : 'low'}
    
    3. Mandatory Course Timings:
    ${JSON.stringify(courseSchedules)}
    
    4. Upcoming Assignments/Deadlines:
    ${JSON.stringify(assignmentContext)}

    Rules for the AI:
    - Start the day at 7:00 AM and end at 10:00 PM.
    - Return a JSON object with a "schedule" key containing an array of objects.
    - Each object: { time, activity, type (class/study/break), reason }.
    - The "reason" should briefly explain why this was scheduled (e.g., "Priority due to high stress risk", "Preparation for Math Quiz", "Mandatory class timing").
    - If Stress Risk is "high", add more 15-minute breaks and a "Mindfulness" session.
    - If Assignment Submission is "late", prioritize "Assignment Work" earlier in the day.
    - If Engagement is "low", break study sessions into smaller 30-minute chunks.
    - Respect the Course Timings exactly.
    - Fill gaps with "Self-Study", "Revision", or "Project Work" targeting specific upcoming assignments.
    - Tone: Helpful and supportive.`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a scheduling assistant. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.5,
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    let rawContent = response.data.choices[0].message.content;
    let scheduleData;
    
    try {
      scheduleData = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
    } catch (e) {
      console.error('Failed to parse AI schedule:', e);
      // Fallback parsing if JSON mode fails or returns markdown
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      }
    }

    res.json(scheduleData || { schedule: [] });
  } catch (error) {
    console.error('AI Schedule Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate schedule' });
  }
});

module.exports = router;
