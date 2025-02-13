const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// Send message to chat
router.post('/message', auth, async (req, res) => {
  try {
    console.log('Test 1 - Received chat request:', {
      messages: req.body.messages?.length,
      token: req.headers.authorization ? 'Present' : 'Missing',
      apiKey: process.env.LECHAT_API_KEY ? 'Present' : 'Missing',
      apiEndpoint: process.env.LECHAT_API_ENDPOINT || '/v1/chat/completions'
    });

    if (!process.env.LECHAT_API_KEY) {
      throw new Error('Test 1 - Missing LeChat API configuration');
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      throw new Error('Test 1 - Invalid messages format');
    }

    const apiUrl = 'https://api.lechat.ai/v1/chat/completions';
    console.log('Test 1 - Making request to:', apiUrl);

    const response = await axios.post(apiUrl, {
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

    console.log('Test 1 - LeChat API response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: Boolean(response.data),
      hasChoices: Boolean(response.data?.choices),
      error: response.data?.error
    });

    if (response.status !== 200 || !response.data) {
      throw new Error('Test 1 - ' + (response.data?.error?.message || response.data?.error || 'LeChat API error'));
    }

    if (!response.data.choices?.[0]?.message) {
      throw new Error('Test 1 - Invalid response format from API');
    }
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Test 1 - Chat API Error Details:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    
    res.status(error.response?.status || 500).json({ 
      message: 'Test 1 - Error processing chat request',
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