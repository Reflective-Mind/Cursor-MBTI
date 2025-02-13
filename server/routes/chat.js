const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// Send message to chat
router.post('/message', auth, async (req, res) => {
  try {
    console.log('Received chat request:', {
      messages: req.body.messages?.length,
      token: req.headers.authorization ? 'Present' : 'Missing',
      apiKey: process.env.LECHAT_API_KEY ? 'Present' : 'Missing'
    });

    if (!process.env.LECHAT_API_KEY) {
      throw new Error('Missing LeChat API configuration');
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      throw new Error('Invalid messages format');
    }

    const response = await axios.post('https://api.lechat.ai/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LECHAT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    console.log('LeChat API response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data ? 'Present' : 'Missing',
      error: response.data?.error
    });

    if (response.status !== 200) {
      throw new Error(response.data?.error?.message || response.data?.error || 'LeChat API error');
    }
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Chat API Error Details:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      },
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    
    res.status(error.response?.status || 500).json({ 
      message: 'Error processing chat request',
      details: error.response?.data?.error?.message || error.message
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