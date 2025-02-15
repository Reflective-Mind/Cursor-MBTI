const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');

console.log('Initializing chat router');

// Initialize Mistral client if API key is available
let mistral;
try {
  if (process.env.MISTRAL_API_KEY) {
    const { MistralClient } = require('@mistralai/mistralai');
    mistral = new MistralClient(process.env.MISTRAL_API_KEY);
    console.log('Chat Router: Mistral AI client initialized successfully');
  }
} catch (error) {
  console.warn('Chat Router: Failed to initialize Mistral AI client:', error.message);
}

// Send message to chat
router.post('/message', auth, async (req, res) => {
  try {
    console.log('Test 5 - Full request details:', {
      headers: {
        auth: req.headers.authorization ? 'Present' : 'Missing',
        contentType: req.headers['content-type'],
        accept: req.headers.accept,
        origin: req.headers.origin,
        host: req.headers.host,
        method: req.method
      },
      body: {
        messageCount: req.body.messages?.length,
        firstMessage: req.body.messages?.[0]?.content?.substring(0, 50),
        lastMessage: req.body.messages?.[req.body.messages?.length - 1]?.content?.substring(0, 50)
      },
      env: {
        mistralKey: process.env.MISTRAL_API_KEY ? 'Present' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      },
      user: req.user ? {
        userId: req.user.userId,
        hasToken: Boolean(req.token)
      } : null
    });

    if (!req.user || !req.token) {
      return res.status(401).json({ message: 'Test 5 - Authentication required' });
    }

    if (!mistral) {
      throw new Error('Test 5 - Mistral AI service not initialized');
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      throw new Error('Test 5 - Invalid messages format');
    }

    // Fetch user's test results
    const testResults = await TestResult.find({ user: req.user.userId }).sort({ createdAt: -1 });
    console.log('Test 5 - Retrieved test results:', {
      count: testResults.length,
      types: testResults.map(r => r.testCategory),
      firstResult: testResults[0] ? {
        id: testResults[0]._id,
        type: testResults[0].result?.type,
        percentages: testResults[0].result?.percentages,
        dominantTraits: testResults[0].result?.dominantTraits,
        answers: testResults[0].answers
      } : null
    });

    // Add system message if not present
    const messages = req.body.messages;
    if (!messages.find(msg => msg.role === 'system')) {
      const systemMessage = {
        role: 'system',
        content: `You are a focused MBTI personality expert assistant. Your responses should be:
1. Brief and to the point
2. Directly related to the user's question
3. MBTI-specific when relevant
4. Limited to 2-3 sentences unless more detail is explicitly requested
5. When uncertain about a question:
   - Ask clarifying questions to better understand the user's intent
   - Relate the question back to MBTI concepts if possible
   - Acknowledge the uncertainty and explain why
6. For MBTI test questions:
   - Provide clear, concise guidance without giving away answers
   - Help users understand the context of the question
   - Explain how different types might approach the situation
7. Focus on helping users understand their preferences rather than providing theoretical explanations
8. If the question is unclear or ambiguous:
   - Request specific examples
   - Ask about the context
   - Suggest MBTI-related aspects that might be relevant

Current user's test results:
${testResults.map(result => `
Test Category: ${result.testCategory}
Type: ${result.result?.type}
Percentages: ${Object.entries(result.result?.percentages || {}).map(([key, value]) => `${key}: ${value}%`).join(', ')}
Dominant Traits: ${Object.entries(result.result?.dominantTraits || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
Answers: ${result.answers?.map(a => `Q: ${a.question} A: ${a.answer}`).join(' | ')}
`).join('\n')}`
      };
      messages.unshift(systemMessage);
      console.log('Test 5 - Added system message:', {
        role: systemMessage.role,
        contentLength: systemMessage.content.length,
        testResultsIncluded: systemMessage.content.includes('Current user\'s test results'),
        firstFewLines: systemMessage.content.split('\n').slice(0, 3).join('\n')
      });
    }

    let response;
    console.log('Test 5 - Using Mistral AI');
    response = await mistral.chatCompletions.create({
      model: "mistral-tiny",
      messages: messages,
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.9
    });
    
    console.log('Test 5 - Raw Mistral response:', JSON.stringify(response, null, 2));

    if (!response?.choices?.[0]?.message) {
      console.error('Test 5 - Invalid response format:', {
        hasResponse: !!response,
        hasChoices: !!response?.choices,
        firstChoice: response?.choices?.[0],
        message: response?.choices?.[0]?.message
      });
      throw new Error('Test 5 - Invalid response format from Mistral AI service');
    }
    
    res.status(200).json({
      choices: [{
        message: response.choices[0].message
      }]
    });
  } catch (error) {
    console.error('Test 5 - Chat API Error Details:', {
      message: error.message,
      response: error.response,
      stack: error.stack,
      user: req.user ? {
        userId: req.user.userId,
        hasToken: Boolean(req.token)
      } : null
    });
    
    const statusCode = error.status || 500;
    res.status(statusCode).json({ 
      message: 'Test 5 - Error processing chat request',
      details: error.message,
      errorType: error.name,
      status: statusCode
    });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    // Implementation will be added
    res.status(200).json({ message: 'Chat history retrieved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    // Implementation will be added
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 