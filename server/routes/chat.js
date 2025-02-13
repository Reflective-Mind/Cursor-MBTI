const express = require('express');
const router = express.Router();
const axios = require('axios');

// Send message to chat
router.post('/message', async (req, res) => {
  try {
    console.log('Received chat request:', {
      endpoint: process.env.LECHAT_API_ENDPOINT,
      messages: req.body.messages,
      apiKey: process.env.LECHAT_API_KEY ? 'Present' : 'Missing'
    });

    if (!process.env.LECHAT_API_KEY || !process.env.LECHAT_API_ENDPOINT) {
      throw new Error('Missing LeChat API configuration');
    }

    const response = await axios.post('https://api.lechat.ai/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
      temperature: 0.7,
      max_tokens: 1000,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LECHAT_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('LeChat API response:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Chat API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    res.status(500).json({ 
      message: 'Error processing chat request',
      details: error.response?.data?.error || error.message
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