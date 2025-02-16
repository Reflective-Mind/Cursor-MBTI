const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

console.log('Initializing testResults router');

// Initialize AI clients if API keys are available
let mistral;
let openai;
let MistralClient;

try {
  if (process.env.MISTRAL_API_KEY) {
    (async () => {
      const { default: { MistralClient: Client } } = await import('@mistralai/mistralai');
      mistral = new Client(process.env.MISTRAL_API_KEY);
      console.log('Test Results Router: Mistral AI client initialized successfully');
    })().catch(console.error);
  }
} catch (error) {
  console.warn('Test Results Router: Failed to initialize Mistral AI client:', error.message);
}

try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('Test Results Router: OpenAI client initialized');
  }
} catch (error) {
  console.warn('Test Results Router: Failed to initialize OpenAI client:', error.message);
}

// Log middleware to track route access
router.use((req, res, next) => {
  console.log('Test Results Route accessed:', {
    method: req.method,
    path: req.path,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
    },
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Store test results
router.post('/', auth, async (req, res) => {
  console.log('POST / handler started');
  try {
    console.log('Received test results request:', {
      userId: req.user?.userId,
      testType: req.body?.testType,
      hasAuth: !!req.headers.authorization,
      contentType: req.headers['content-type'],
      bodyKeys: Object.keys(req.body || {}),
      timestamp: new Date().toISOString()
    });

    // Map test type to category
    const testTypeMapping = {
      'mbti-8': 'mbti-8',
      'mbti-24': 'mbti-24',
      'mbti-100': 'mbti-100'
    };

    const testCategory = testTypeMapping[req.body.testType];
    if (!testCategory) {
      console.error('Invalid test type:', {
        receivedType: req.body.testType,
        allowedTypes: Object.keys(testTypeMapping)
      });
      return res.status(400).json({ message: 'Invalid test type' });
    }

    // Validate required fields
    if (!req.body.result || !req.body.answers || !req.body.questions) {
      console.error('Missing required fields:', {
        hasResult: !!req.body.result,
        hasAnswers: !!req.body.answers,
        hasQuestions: !!req.body.questions,
        body: req.body
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if a result for this test category already exists
    console.log('Checking for existing test result:', {
      userId: req.user.userId,
      testCategory
    });

    const existingResult = await TestResult.findOne({
      user: req.user.userId,
      testCategory
    });

    let savedResult;
    if (existingResult) {
      console.log('Updating existing test result:', {
        resultId: existingResult._id,
        testCategory
      });
      // Update existing result
      existingResult.result = req.body.result;
      existingResult.answers = req.body.answers.map(answer => ({
        ...answer,
        question: req.body.questions.find(q => q.id === answer.questionId)?.text,
        category: req.body.questions.find(q => q.id === answer.questionId)?.category
      }));
      existingResult.analysisVersion += 1;
      savedResult = await existingResult.save();
    } else {
      console.log('Creating new test result');
      // Create new result
      const testResult = new TestResult({
        user: req.user.userId,
        testCategory,
        result: req.body.result,
        answers: req.body.answers.map(answer => ({
          ...answer,
          question: req.body.questions.find(q => q.id === answer.questionId)?.text,
          category: req.body.questions.find(q => q.id === answer.questionId)?.category
        }))
      });
      savedResult = await testResult.save();
    }

    // Calculate weighted personality type
    const weightedResult = await TestResult.calculateWeightedType(req.user.userId);
    
    if (weightedResult) {
      console.log('Updating user MBTI type with weighted calculation:', {
        userId: req.user.userId,
        oldType: req.body.result.type,
        newType: weightedResult.type,
        testBreakdown: weightedResult.testBreakdown
      });

      // Update user's MBTI type with weighted result
      await User.findByIdAndUpdate(req.user.userId, {
        mbtiType: weightedResult.type,
        personalityTraits: [
          { trait: 'Extroversion-Introversion', strength: weightedResult.percentages.E },
          { trait: 'Sensing-Intuition', strength: weightedResult.percentages.S },
          { trait: 'Thinking-Feeling', strength: weightedResult.percentages.T },
          { trait: 'Judging-Perceiving', strength: weightedResult.percentages.J }
        ]
      });

      // Add weighted calculation to the response
      savedResult = {
        ...savedResult.toObject(),
        weightedResult
      };
    }

    console.log('Successfully saved test result:', {
      resultId: savedResult._id,
      testCategory,
      isNew: !existingResult,
      hasWeightedResult: !!weightedResult
    });
    
    return res.status(existingResult ? 200 : 201).json(savedResult);
  } catch (error) {
    console.error('Error in POST / handler:', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.user?.userId,
      testType: req.body?.testType,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: 'Error storing test results',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a test endpoint to verify the router is working
router.get('/ping', (req, res) => {
  console.log('Ping endpoint accessed');
  res.json({ message: 'Test results router is working' });
});

// Test endpoint to verify router is working
router.get('/test', (req, res) => {
  console.log('GET /test endpoint accessed');
  res.json({ 
    message: 'Test results router test endpoint is working',
    routes: router.stack.map(layer => ({
      path: layer.route?.path,
      methods: layer.route ? Object.keys(layer.route.methods) : undefined
    })).filter(r => r.path)
  });
});

// Debug endpoint to check test results
router.get('/debug/results/:userId', auth, async (req, res) => {
  try {
    console.log('Checking test results for user:', req.params.userId);
    
    const results = await TestResult.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    
    console.log('Found results:', {
      count: results.length,
      results: results.map(r => ({
        id: r._id,
        category: r.testCategory,
        type: r.result?.type,
        createdAt: r.createdAt
      }))
    });
    
    res.json({
      count: results.length,
      results: results.map(r => ({
        id: r._id,
        category: r.testCategory,
        type: r.result?.type,
        createdAt: r.createdAt,
        hasPercentages: !!r.result?.percentages,
        hasDominantTraits: !!r.result?.dominantTraits
      }))
    });
  } catch (error) {
    console.error('Error checking test results:', error);
    res.status(500).json({ message: 'Error checking test results' });
  }
});

// Log that the router is ready
console.log('Test results router initialized with routes:', {
  routes: router.stack.map(layer => ({
    path: layer.route?.path,
    methods: layer.route ? Object.keys(layer.route.methods) : undefined
  })).filter(r => r.path)
});

module.exports = router; 