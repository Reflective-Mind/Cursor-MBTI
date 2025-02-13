const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting user profile' });
  }
});

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    console.log('Test 4 - Fetching user profile:', {
      userId: req.params.userId,
      requestingUser: req.user.userId
    });

    const user = await User.findById(req.params.userId)
      .select('-password -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add online status
    user.isOnline = user.status === 'online';
    
    console.log('Test 4 - User profile found:', {
      username: user.username,
      mbtiType: user.mbtiType,
      isOnline: user.isOnline
    });

    res.json(user);
  } catch (error) {
    console.error('Test 4 - Error fetching user profile:', {
      error: error.message,
      userId: req.params.userId
    });
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.patch('/:userId', auth, async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const allowedUpdates = ['username', 'mbtiType', 'avatar'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Get online users
router.get('/status/online', auth, async (req, res) => {
  try {
    const onlineUsers = await User.find({ status: 'online' });
    res.json({
      users: onlineUsers.map(user => user.getPublicProfile())
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Error getting online users' });
  }
});

module.exports = router; 