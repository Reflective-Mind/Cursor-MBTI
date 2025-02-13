const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MistralClient } = require('@mistralai/mistralai');

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
        apiKey: process.env.MISTRAL_API_KEY ? 'Present' : 'Missing',
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

    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('Test 5 - Mistral API key is missing');
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      throw new Error('Test 5 - Invalid messages format');
    }

    const client = new MistralClient(process.env.MISTRAL_API_KEY);
    const model = "mistral-medium";

    console.log('Test 5 - Making request to Mistral API:', {
      model,
      messageCount: req.body.messages.length,
      apiKey: process.env.MISTRAL_API_KEY ? 'Present' : 'Missing'
    });

    const response = await client.chatCompletions.create({
      model,
      messages: req.body.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      safeMode: true
    });

    console.log('Test 5 - Mistral API response:', {
      hasChoices: Boolean(response.choices),
      firstChoice: response.choices?.[0]?.message?.content?.substring(0, 50)
    });

    if (!response.choices?.[0]?.message) {
      throw new Error('Test 5 - Invalid response format from API');
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