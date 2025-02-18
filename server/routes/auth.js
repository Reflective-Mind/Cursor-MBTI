const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
    }
    cb(null, true);
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', {
      email: req.body.email,
      username: req.body.username
    });

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: req.body.email.toLowerCase() },
        { username: req.body.username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        field: existingUser.email === req.body.email.toLowerCase() ? 'email' : 'username'
      });
    }

    // Create new user
    const user = new User({
      username: req.body.username,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      roles: req.body.email.toLowerCase() === 'eideken@hotmail.com' ? ['user', 'admin'] : ['user']
    });

    await user.save();
    console.log('User created successfully:', {
      id: user._id,
      email: user.email,
      username: user.username
    });

    // Add user to all public channels
    const publicChannels = await Channel.find({ isPrivate: false });
    for (const channel of publicChannels) {
      channel.members.push({
        user: user._id,
        roles: ['member']
      });
      await channel.save();
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Register error:', {
      message: error.message,
      stack: error.stack,
      body: {
        ...req.body,
        password: '[REDACTED]'
      },
      headers: req.headers
    });
    res.status(500).json({ 
      message: 'Error registering user', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', {
      email: req.body.email,
      headers: {
        'content-type': req.headers['content-type'],
        origin: req.headers.origin
      },
      timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user - convert email to lowercase for case-insensitive comparison
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email.toLowerCase());
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Found user:', {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      mbtiType: user.mbtiType,
      status: user.status,
      timestamp: new Date().toISOString()
    });

    // Check password
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password check result:', {
        userId: user._id,
        isMatch: isMatch,
        timestamp: new Date().toISOString()
      });

      if (!isMatch) {
        console.log('Invalid password for user:', email.toLowerCase());
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (passwordError) {
      console.error('Password comparison error:', {
        userId: user._id,
        email: user.email,
        error: {
          code: passwordError.code,
          message: passwordError.message,
          stack: passwordError.stack
        },
        timestamp: new Date().toISOString()
      });
      
      // Handle specific password comparison errors
      if (passwordError.code === 'NO_PASSWORD_HASH') {
        return res.status(500).json({ message: 'Account configuration error' });
      }
      if (passwordError.code === 'NO_CANDIDATE_PASSWORD') {
        return res.status(400).json({ message: 'Password is required' });
      }
      
      // For other errors, send a generic error message
      return res.status(500).json({ 
        message: 'Error during authentication',
        details: process.env.NODE_ENV === 'development' ? passwordError.message : undefined
      });
    }

    // Update status to online
    user.status = 'online';
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful:', {
      userId: user._id,
      email: user.email,
      mbtiType: user.mbtiType,
      timestamp: new Date().toISOString()
    });

    // Get profile sections with test breakdown
    const TestResult = mongoose.model('TestResult');
    let weightedResult = null;
    let profileSections = [];
    
    try {
      weightedResult = await TestResult.calculateWeightedType(user._id);
      console.log('Weighted result calculated:', {
        userId: user._id,
        hasResult: !!weightedResult,
        type: weightedResult?.type,
        testCount: weightedResult?.testBreakdown?.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error calculating weighted result:', {
        userId: user._id,
        error: {
          message: error.message,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      });
      // Don't fail login if test results calculation fails
    }

    try {
      profileSections = await user.getProfileSections(weightedResult);
      console.log('Profile sections generated:', {
        userId: user._id,
        sectionCount: profileSections?.length,
        firstSection: profileSections?.[0]?.title,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating profile sections:', {
        userId: user._id,
        error: {
          message: error.message,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      });
      // Don't fail login if profile sections generation fails
      profileSections = [];
    }

    // Prepare response
    const response = {
      token,
      user: {
        ...user.getPublicProfile(),
        sections: profileSections || [],
        profileSections: profileSections || [],
        weightedResult: weightedResult || null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      body: {
        ...req.body,
        password: '[REDACTED]'
      },
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: 'Error logging in',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user data' });
  }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'avatar', 'bio', 'mbtiType', 'status'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.status = 'offline';
      user.lastActive = new Date();
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

// Delete account
router.delete('/me', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if it exists and isn't the default
    if (user.avatar && user.avatar !== 'default-avatar.png') {
      const oldAvatarPath = path.join('uploads/avatars', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar
    user.avatar = req.file.filename;
    await user.save();

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Get user profile by ID
router.get('/users/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error getting user profile' });
  }
});

module.exports = router; 