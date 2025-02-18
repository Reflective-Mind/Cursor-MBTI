const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.patch('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all channels
router.get('/channels', auth, isAdmin, async (req, res) => {
  try {
    const channels = await Channel.find({});
    res.json({ channels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new channel
router.post('/channels', auth, isAdmin, async (req, res) => {
  try {
    console.log('Received channel creation request:', {
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
      },
      user: req.user
    });

    const { name, description, category, type } = req.body;

    // Validate required fields
    if (!name) {
      console.log('Channel creation failed: name is required');
      return res.status(400).json({ message: 'Channel name is required' });
    }

    // Check if channel with same name exists
    const existingChannel = await Channel.findOne({ name: name.toLowerCase() });
    if (existingChannel) {
      console.log('Channel creation failed: name already exists');
      return res.status(400).json({ message: 'Channel with this name already exists' });
    }

    // Create new channel
    const channel = new Channel({
      name: name.toLowerCase(),
      description,
      category: category || 'general',
      type: type || 'text',
      members: [], // Initialize empty members array
      createdBy: req.user.userId
    });

    // Add all existing users to the channel
    const users = await User.find({});
    channel.members = users.map(user => ({
      user: user._id,
      roles: ['member']
    }));

    await channel.save();
    console.log('Channel created successfully:', channel);
    
    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update channel
router.patch('/channels/:channelId', auth, isAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const channel = await Channel.findByIdAndUpdate(
      req.params.channelId,
      { $set: updates },
      { new: true }
    );
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete channel
router.delete('/channels/:channelId', auth, isAdmin, async (req, res) => {
  try {
    const channel = await Channel.findByIdAndDelete(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 