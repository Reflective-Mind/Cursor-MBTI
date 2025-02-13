const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Channel = require('../models/Channel');

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    // Implementation will be added
    res.status(200).json({ message: 'Posts retrieved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new post
router.post('/posts', async (req, res) => {
  try {
    // Implementation will be added
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    // Implementation will be added
    res.status(200).json({ message: 'Post retrieved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment to post
router.post('/posts/:id/comments', async (req, res) => {
  try {
    // Implementation will be added
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posts by personality type
router.get('/posts/type/:type', async (req, res) => {
  try {
    // Implementation will be added
    res.status(200).json({ message: 'Posts by type retrieved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all channels
router.get('/channels', auth, async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [
        { isPrivate: false },
        {
          isPrivate: true,
          'members.user': req.user.userId
        }
      ]
    }).populate('members.user', 'username avatar status');
    
    res.json({ channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Error fetching channels' });
  }
});

// Get channel by ID
router.get('/channels/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json({ channel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new channel
router.post('/channels', auth, async (req, res) => {
  try {
    const channel = new Channel({
      ...req.body,
      members: [{ user: req.user.userId, roles: ['admin'] }]
    });
    await channel.save();
    res.status(201).json({ channel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 