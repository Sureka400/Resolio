const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Initialize AI providers conditionally
let geminiModel;
if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('replace_with_your')) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (e) {
    console.warn('Failed to initialize Gemini:', e.message);
  }
}

let openai;
if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('replace_with_your')) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (e) {
    console.warn('Failed to initialize OpenAI:', e.message);
  }
}

// Helper function to call Groq API
async function callGroqAPI(message, systemPrompt) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('replace_with_your')) {
    throw new Error('Groq API key not configured');
  }

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content.trim();
    }

    throw new Error('Unexpected response format from Groq API');
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to call Hugging Face Inference API (Free alternative)
async function callHuggingFaceAPI(message, systemPrompt) {
  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY.includes('replace_with_your')) {
    throw new Error('Hugging Face API key not configured');
  }

  // Use the new router endpoint and a supported free model
  const model = 'Qwen/Qwen2.5-7B-Instruct';
  
  const response = await axios.post('https://router.huggingface.co/v1/chat/completions', {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: 500,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
    return response.data.choices[0].message.content.trim();
  }

  throw new Error('Unexpected response format from Hugging Face API');
}

// Helper function - Simple smart responses based on question type
async function callSimpleAPI(message, role) {
  const lowerMessage = message.toLowerCase();
  
  // Knowledge base for common questions
  const knowledgeBase = {
    // Science - Core Concepts
    'photosynthesis|plant|oxygen|glucose|sunlight': 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose (sugar) and oxygen. It occurs in two stages: Light-dependent reactions in the thylakoid membranes capture solar energy and produce ATP and NADPH. Light-independent reactions (Calvin Cycle) in the stroma use this energy to convert CO2 into glucose. The overall equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. This process is essential for life on Earth as it produces oxygen and forms the base of most food chains.',
    
    'mitochondria|powerhouse|energy|atp|cell': 'Mitochondria are known as the "powerhouse" of the cell. They are organelles that convert nutrients into ATP (adenosine triphosphate), the energy currency of the cell. Each mitochondrion has a double membrane (outer and inner), and the inner membrane is folded into cristae to increase surface area. Mitochondria contain their own DNA (mtDNA) and can replicate independently. They use the citric acid cycle and electron transport chain to extract energy from food molecules. Cells with high energy demands (like muscle and nerve cells) have more mitochondria.',
    
    'dna|gene|genetic|chromosome|helix': 'DNA (deoxyribonucleic acid) is the molecule that carries genetic instructions for life. It has a double helix structure made of two complementary strands. Each strand consists of nucleotides containing a sugar (deoxyribose), a phosphate group, and a nitrogenous base (A, T, G, or C). DNA replicates through semi-conservative replication, where the strands separate and serve as templates for new strands. DNA contains genes that code for proteins, which determine an organism\'s traits and functions.',
    
    // Math - Core Concepts
    'algebra|variable|equation|polynomial|solve|x\\+|math': 'Algebra is the branch of mathematics that uses letters (variables) to represent unknown numbers. In solving algebraic equations: (1) Identify the variable, (2) Use inverse operations to isolate it, (3) Keep equations balanced by doing the same operation on both sides. Example: Solve 2x + 5 = 13. Subtract 5: 2x = 8. Divide by 2: x = 4. Verify: 2(4) + 5 = 13 ✓. Practice with multiple problems to master different equation types.',
    
    'quadratic|linear|formula|graph|function': 'An equation is a mathematical statement where two expressions are equal (containing an = sign). Linear equations have variables to the first power (2x + 3 = 7). Quadratic equations have x² terms (x² - 5x + 6 = 0). To solve: (1) Get all terms on one side, (2) Simplify, (3) Use appropriate method (factoring, quadratic formula, graphing). Always verify your solution by substituting back into the original equation.',
    
    'calculus|derivative|integral|limit|rate of change': 'Calculus studies how things change. It has two main parts: Differentiation (finding rates of change/slopes) and Integration (finding areas under curves). The derivative of a function f(x) shows how fast it\'s changing at any point. The integral is the reverse of differentiation. Applications include: finding maximum/minimum values, calculating areas/volumes, analyzing motion, and optimizing systems. Limits are fundamental - they describe behavior as variables approach specific values.',
    
    // Literature & Writing
    'essay|writing|paragraph|thesis|introduction': 'A strong essay has: (1) Introduction with a clear thesis statement, (2) Body paragraphs with topic sentences supporting the thesis, (3) Evidence/examples for each claim, (4) Analysis connecting evidence to your argument, (5) Conclusion restating the thesis. Write clearly and concisely. Each paragraph should focus on one main idea. Use transitions between paragraphs. Proofread for grammar and spelling. Show, don\'t just tell - use examples.',
    
    'literature|character|plot|theme|story|novel|book': 'Literature analysis involves understanding: (1) Plot - the sequence of events, (2) Character - motivation, development, relationships, (3) Theme - the central message or universal ideas, (4) Setting - time and place that influence the story, (5) Point of view - who\'s telling the story, (6) Symbolism - objects/events representing deeper meaning. To analyze: identify literary devices used, examine how they support the theme, consider the author\'s purpose and audience.',
    
    // History & Social Studies
    'history|war|empire|revolution|century|date|event|historical': 'History is the study of past events, people, and civilizations. Key skills: (1) Understand chronology - the sequence of events, (2) Identify causes and effects, (3) Recognize different perspectives from primary sources, (4) Analyze how past events shape the present. When studying history: create timelines, read primary sources, compare different accounts, consider social/economic/political factors. History helps us understand current issues and human nature.',
    
    // Study Tips & Learning
    'study|learn|study tips|recall|memory|retention': 'Effective study strategies: (1) Active recall - test yourself instead of just re-reading, (2) Spaced repetition - review material over time, not all at once, (3) Feynman Technique - explain concepts simply to deepen understanding, (4) Pomodoro - study 25 minutes then take a 5-minute break, (5) Create summaries and mind maps, (6) Teach someone else the material, (7) Mix up subjects to strengthen connections. Understand concepts deeply rather than memorizing.',
    
    'exam|test|prepare|preparation|tips': 'Exam preparation: (1) Start early - don\'t cram, (2) Review all material systematically, (3) Take practice tests under timed conditions, (4) Identify weak areas and focus there, (5) Get good sleep before the exam, (6) Eat a healthy breakfast, (7) Read questions carefully before answering, (8) Manage time - answer easier questions first, (9) Review your answers if time permits. Practice with old exams if available.',
    
    // General Academic Topics
    'science|biology|chemistry|physics': 'Science is the systematic study of nature through observation and experimentation. Main branches: (1) Biology - study of living organisms, (2) Chemistry - study of matter and reactions, (3) Physics - study of forces and energy. Scientific method: (1) Observe, (2) Form hypothesis, (3) Test with experiments, (4) Analyze results, (5) Draw conclusions. Always cite sources and document your methods.',
  };
  
  // Check for regex matches
  for (const [keywords, answer] of Object.entries(knowledgeBase)) {
    const regex = new RegExp(keywords, 'i');
    if (regex.test(lowerMessage)) {
      return answer;
    }
  }
  
  return null;
}

// Fallback demo mode (works without API keys)
async function callDemoAPI(message, role) {
  // Try smart API first
  const smartAnswer = await callSimpleAPI(message, role);
  if (smartAnswer) {
    return smartAnswer;
  }
  
  const lowerMessage = message.toLowerCase();

  if (role === 'student') {
    // Math/Algebra
    if (lowerMessage.match(/algebra|equation|solve|variable|x\+|polynomial|math|number|calculation/i)) {
      return 'For solving algebraic equations:\n1) Identify the variable and isolate it\n2) Use inverse operations (addition↔subtraction, multiplication↔division)\n3) Check your solution by substituting back\n\nExample: For x + 5 = 12, subtract 5 from both sides to get x = 7. Verify: 7 + 5 = 12 ✓\n\nTry working through similar problems to build confidence. The key is understanding WHY we do each step, not just memorizing the process.';
    }

    // Science
    if (lowerMessage.match(/science|biology|chemistry|physics|atom|cell|reaction|force|energy|molecule/i)) {
      return 'Great science question! Here\'s how to approach it:\n1) Understand the basic definition and key components\n2) See how the parts interact with each other\n3) Look for real-world examples\n4) Draw diagrams to visualize concepts\n5) Practice with problems\n\nScience is about understanding systems - break them into smaller parts, master each part, then see how they work together. What specific topic are you studying?';
    }

    // Literature/Language
    if (lowerMessage.match(/literature|essay|grammar|writing|plot|character|theme|story|poem|author/i)) {
      return 'For understanding literature and writing:\n1) Read actively - annotate important passages\n2) Identify main ideas, supporting details, and themes\n3) Analyze CHARACTER motivations, PLOT progression, SYMBOLISM\n4) Write analytical responses (don\'t just summarize)\n5) Revise and refine your work\n\nStrong writing shows critical thinking - analyze WHY the author made choices and what they reveal. Would you like help with a specific text?';
    }

    // History/Social Studies
    if (lowerMessage.match(/history|war|empire|revolution|century|date|event|historical|ancient|modern/i)) {
      return 'To master history:\n1) Create TIMELINES to understand the sequence\n2) Learn CAUSES and CONSEQUENCES - why did things happen?\n3) Analyze DIFFERENT PERSPECTIVES - who benefits? Who loses?\n4) Connect PAST to MODERN CONTEXT\n5) Use primary sources for authentic understanding\n\nHistory isn\'t just memorizing dates - it\'s understanding how human decisions shape civilizations. Which period are you studying?';
    }

    // Study Tips & Exam Prep
    if (lowerMessage.match(/study|tips|improve|prepare|exam|test|homework|assignment|quiz|learn/i)) {
      return 'Effective study strategies:\n1) ACTIVE RECALL - test yourself, don\'t just re-read\n2) SPACED REPETITION - review over time, not cramming\n3) FEYNMAN TECHNIQUE - explain concepts in simple words\n4) POMODORO METHOD - 25 min focus + 5 min break\n5) CREATE SUMMARIES & MIND MAPS\n6) TEACH OTHERS - explaining forces deeper learning\n7) SLEEP WELL - consolidates memory\n\nFocus on understanding deeply rather than memorizing facts. Which subject needs help?';
    }

    // Understanding concepts
    if (lowerMessage.match(/what is|define|mean|concept|definition|explain|tell me about/i)) {
      return 'To understand any concept deeply:\n1) Get the BASIC DEFINITION\n2) BREAK IT DOWN into smaller parts\n3) Find REAL-WORLD EXAMPLES you relate to\n4) CONNECT to things you already know\n5) PRACTICE with applications\n6) TEACH IT to someone in your own words\n\nDeep understanding comes from asking "Why?" and "How?" not just memorizing. Tell me the concept you\'re learning!';
    }

    // Problem solving
    if (lowerMessage.match(/how do|solve|problem|answer|help me|stuck|can\'t|difficult|challenge/i)) {
      return 'When you\'re stuck on a problem:\n1) READ CAREFULLY - what exactly is being asked?\n2) LIST WHAT YOU KNOW - what information do you have?\n3) RECALL SIMILAR PROBLEMS - what techniques worked before?\n4) TRY DIFFERENT APPROACHES - don\'t give up on the first try\n5) CHECK YOUR ANSWER - does it make sense?\n6) LEARN FROM MISTAKES - understand why it was wrong\n\nMaking mistakes is learning - each wrong attempt teaches you something. What\'s the problem?';
    }

    // Default for students
    return 'I\'m here to help you learn! Ask me about:\n✓ Explaining concepts\n✓ Solving math, science, history problems\n✓ Essay writing and literature\n✓ Study tips and exam prep\n✓ Understanding difficult topics\n✓ How to approach homework\n\nWhat would you like help with?';
  } 

  else if (role === 'teacher') {
    // Lesson Planning
    if (lowerMessage.match(/lesson|plan|curriculum|activity|teach|instruction|objective|design/i)) {
      return 'Effective lesson planning framework:\n1) DEFINE OBJECTIVES - use Bloom\'s taxonomy (Remember → Create)\n2) DESIGN ACTIVITIES - match objectives and student levels\n3) VARY METHODS - visual, auditory, kinesthetic, reading/writing\n4) ASSESS UNDERSTANDING - formative checks during lesson\n5) PREPARE MATERIALS - have backups and contingencies\n6) CONSIDER TIMING - allocate realistic time per component\n\nStudent engagement increases when lessons are clear, varied, and purposeful. What grade level and subject?';
    }

    // Assessment
    if (lowerMessage.match(/assessment|test|quiz|grade|evaluate|rubric|exam|feedback|performance/i)) {
      return 'Assessment best practices:\n1) FORMATIVE - during learning (exit tickets, observations, quick quizzes)\n2) SUMMATIVE - measure final learning (tests, projects, presentations)\n3) CREATE RUBRICS - specific criteria BEFORE grading\n4) GIVE FEEDBACK - specific, actionable, growth-focused, timely\n5) USE MULTIPLE TYPES - variety shows different skills\n6) DATA-DRIVEN - use results to adjust instruction\n\nAssessment is about understanding learning, not just assigning grades. What are you assessing?';
    }

    // Student Engagement
    if (lowerMessage.match(/student|engagement|motivation|behavior|discipline|classroom|management|struggling|connection/i)) {
      return 'Building student engagement:\n1) RELATIONSHIPS - know students as individuals, show genuine care\n2) RELEVANCE - connect content to their lives and interests\n3) AUTONOMY - give choices and voice in learning\n4) CHALLENGE - pitch difficulty right (not too easy, not frustrating)\n5) FEEDBACK - provide growth-oriented comments\n6) CELEBRATION - recognize effort and growth, not just perfection\n\nStudents engage when they feel valued, understood, and capable. Which students are you trying to reach?';
    }

    // Differentiation
    if (lowerMessage.match(/differentiate|special needs|gifted|struggling|adapt|accommodation|modify|diverse|ell|support/i)) {
      return 'Differentiation strategies:\n1) ASSESS NEEDS - understand abilities, learning styles, backgrounds\n2) MULTIPLE ENTRY POINTS - different ways to access content\n3) FLEXIBLE GROUPING - vary groups by needs\n4) SCAFFOLDING - support struggling learners\n5) EXTENSIONS - challenge advanced students with depth\n6) CHOICE - options in assignments, materials, demonstrations\n7) TECHNOLOGY - personalized learning platforms\n\nEvery student succeeds when taught in ways matching their needs. What differences are you seeing?';
    }

    // Professional Development
    if (lowerMessage.match(/develop|improve|technique|method|pedagogy|research|best practice|effective|growth|skill/i)) {
      return 'Professional growth strategies:\n1) RESEARCH - stay current with educational studies\n2) CONFERENCES/PD - learn from experts and colleagues\n3) COLLABORATION - observe others, share ideas, co-teach\n4) REFLECTION - journal about successes and challenges\n5) EXPERIMENTATION - try new strategies, document results\n6) SPECIALIZATION - develop expertise in areas you\'re passionate about\n7) NETWORKS - join professional organizations, communities\n\nGreat teachers are continuous learners who reflect and adapt. What area interests you?';
    }

    // Default for teachers
    return 'Welcome! I can help with:\n✓ Lesson planning and curriculum design\n✓ Assessment strategies and grading\n✓ Classroom management and engagement\n✓ Differentiation for diverse learners\n✓ Teaching techniques and pedagogy\n✓ Professional development\n✓ Student motivation\n\nWhat aspect of teaching can I support?';
  }

  // Fallback for unknown role
  return 'I\'m an educational AI assistant designed to help students learn and teachers improve their practice! Tell me:\n1) Your role - are you a student or teacher?\n2) Your question or topic\n\nWith that information, I can provide targeted guidance specific to your needs.';
}

// Chat endpoint for students and teachers
router.post('/', async (req, res) => {
  try {
    const { message, role } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let systemPrompt = '';
    if (role === 'student') {
      systemPrompt = 'You are an expert educational tutor helping students understand concepts deeply. When a student asks a question, provide a detailed, specific answer with examples. Be accurate, clear, and thorough. Answer the exact question asked without generic templates.';
    } else if (role === 'teacher') {
      systemPrompt = 'You are an expert educational consultant helping teachers improve their practice. Provide specific, actionable advice tailored to their exact question. Be professional and detailed.';
    } else {
      systemPrompt = 'You are a helpful educational AI assistant. Answer the user\'s question directly and specifically.';
    }

    let aiResponse;
    let apiUsed = 'demo';

    try {
      aiResponse = await callGroqAPI(message, systemPrompt);
      apiUsed = 'Groq';
      console.log('✅ Groq API request successful');
    } catch (groqError) {
      console.log('⚠️ Groq API failed:', groqError.message);
      
      try {
        if (!openai) throw new Error('OpenAI not configured');
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1024,
        });
        aiResponse = completion.choices[0].message.content;
        apiUsed = 'OpenAI';
        console.log('✅ OpenAI API request successful');
      } catch (openaiError) {
        console.log('⚠️ OpenAI API failed:', openaiError.message);
        
        try {
          if (!geminiModel) throw new Error('Gemini not configured');
          const prompt = `${systemPrompt}\n\nUser: ${message}`;
          const result = await geminiModel.generateContent(prompt);
          const response = await result.response;
          aiResponse = response.text();
          apiUsed = 'Gemini';
          console.log('✅ Gemini API request successful');
        } catch (geminiError) {
          console.log('⚠️ Gemini failed:', geminiError.message);
          
          try {
            aiResponse = await callHuggingFaceAPI(message, systemPrompt);
            apiUsed = 'Hugging Face';
            console.log('✅ Hugging Face API request successful');
          } catch (hfError) {
            console.log('⚠️ Hugging Face failed:', hfError.message);
            
            try {
              aiResponse = await callDemoAPI(message, role);
              apiUsed = 'Smart Knowledge Base';
              console.log('✅ Knowledge Base response generated');
            } catch (demoError) {
              console.log('⚠️ Knowledge Base failed:', demoError.message);
              throw new Error('All AI APIs failed. Please try again later.');
            }
          }
        }
      }
    }
    
    console.log(`[${apiUsed}] Responding to: "${message.substring(0, 50)}..."`);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
      return res.status(429).json({ 
        message: 'API rate limit exceeded. All providers are temporarily unavailable. Please try again in a few moments.',
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Failed to get AI response', error: error.message });
  }
});

module.exports = router;