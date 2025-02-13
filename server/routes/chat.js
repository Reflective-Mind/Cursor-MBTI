const express = require('express');
const router = express.Router();
const axios = require('axios');

// Send message to chat
router.post('/message', async (req, res) => {
  try {
    const response = await axios.post(process.env.LECHAT_API_ENDPOINT, {
      messages: req.body.messages,
      temperature: 0.7,
      max_tokens: 1000,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LECHAT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Chat API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Error processing chat request',
      error: error.response?.data || error.message 
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