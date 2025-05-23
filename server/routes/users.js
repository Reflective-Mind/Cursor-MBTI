const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const TestResult = require('../models/TestResult');
const path = require('path');

console.log('Initializing users router');

// Initialize AI clients if API keys are available
let mistralClient;
let openai;

(async () => {
  try {
    if (process.env.MISTRAL_API_KEY) {
      const mistralModule = await import('@mistralai/mistralai/src/client.js');
      mistralClient = new mistralModule.default(process.env.MISTRAL_API_KEY);
      console.log('Users Router: Mistral AI client initialized successfully');
    } else {
      console.warn('Users Router: MISTRAL_API_KEY is not set in environment variables');
    }
  } catch (error) {
    console.warn('Users Router: Failed to initialize Mistral AI client:', error.message);
  }

  try {
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('Users Router: OpenAI client initialized');
    }
  } catch (error) {
    console.warn('Users Router: Failed to initialize OpenAI client:', error.message);
  }
})();

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Test 8 - Fetching current user profile:', {
      userId: req.user.userId
    });

    const user = await User.findById(req.user.userId)
      .select('-password -__v');

    if (!user) {
      console.log('Test 8 - Current user not found:', {
        userId: req.user.userId
      });
      return res.status(404).json({ message: 'User not found' });
    }

    // Add online status and last active time
    const userData = user.toObject();
    userData.isOnline = userData.status === 'online';
    userData.lastActive = userData.lastActive || new Date();

    // Get profile sections with test breakdown
    const sections = await user.getProfileSections();
    userData.sections = sections;
    userData.profileSections = sections;

    console.log('Test 8 - Current user profile found:', {
      username: userData.username,
      mbtiType: userData.mbtiType,
      isOnline: userData.isOnline,
      lastActive: userData.lastActive,
      sectionCount: userData.sections?.length,
      sections: userData.sections
    });

    res.json(userData);
  } catch (error) {
    console.error('Test 8 - Get current user error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.userId
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Error getting user profile' });
  }
});

// Get user profile by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    console.log('Test 7 - Fetching user profile:', {
      requestedUserId: req.params.userId,
      requestingUserId: req.user.userId
    });

    const user = await User.findById(req.params.userId)
      .select('-password -__v -email')
      .lean();

    if (!user) {
      console.log('Test 7 - User not found:', {
        requestedUserId: req.params.userId
      });
      return res.status(404).json({ message: 'User not found' });
    }

    // Add online status and last active time
    user.isOnline = user.status === 'online';
    user.lastActive = user.lastActive || new Date();
    
    console.log('Test 7 - User profile found:', {
      username: user.username,
      mbtiType: user.mbtiType,
      isOnline: user.isOnline,
      lastActive: user.lastActive
    });

    res.json(user);
  } catch (error) {
    console.error('Test 7 - Error fetching user profile:', {
      error: error.message,
      stack: error.stack,
      requestedUserId: req.params.userId
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
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

    const allowedUpdates = [
      'username',
      'mbtiType',
      'bio',
      'avatar',
      'personalityTraits',
      'interests',
      'favoriteQuote',
      'socialLinks',
      'location',
      'occupation',
      'education',
      'languages',
      'achievements',
      'theme'
    ];

    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        // Validate nested objects
        if (['personalityTraits', 'interests', 'languages', 'achievements'].includes(key)) {
          if (!Array.isArray(req.body[key])) {
            throw new Error(`${key} must be an array`);
          }
        }
        
        // Validate personality traits
        if (key === 'personalityTraits') {
          req.body[key].forEach(trait => {
            if (!trait.trait || typeof trait.strength !== 'number' || 
                trait.strength < 0 || trait.strength > 100) {
              throw new Error('Invalid personality trait format');
            }
          });
        }

        // Validate languages
        if (key === 'languages') {
          req.body[key].forEach(lang => {
            if (!lang.name || !['beginner', 'intermediate', 'advanced', 'native'].includes(lang.proficiency)) {
              throw new Error('Invalid language format');
            }
          });
        }

        // Validate social links
        if (key === 'socialLinks') {
          const allowedSocialLinks = ['twitter', 'linkedin', 'github', 'website'];
          Object.keys(req.body[key]).forEach(social => {
            if (!allowedSocialLinks.includes(social)) {
              throw new Error('Invalid social link type');
            }
          });
        }

        // Validate theme
        if (key === 'theme') {
          const { primaryColor, accentColor, layout } = req.body[key];
          if (layout && !['classic', 'modern', 'minimal'].includes(layout)) {
            throw new Error('Invalid theme layout');
          }
          if (primaryColor && !/^#[0-9A-F]{6}$/i.test(primaryColor)) {
            throw new Error('Invalid primary color format');
          }
          if (accentColor && !/^#[0-9A-F]{6}$/i.test(accentColor)) {
            throw new Error('Invalid accent color format');
          }
        }

        obj[key] = req.body[key];
        return obj;
      }, {});

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', {
      error: error.message,
      stack: error.stack,
      requestedUserId: req.params.userId
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ 
      message: 'Error updating user profile',
      details: error.message
    });
  }
});

// Get online users
router.get('/status/online', auth, async (req, res) => {
  try {
    console.log('Test 7 - Fetching online users');
    
    const onlineUsers = await User.find({ status: 'online' })
      .select('username avatar status lastActive mbtiType')
      .lean();

    console.log('Test 7 - Found online users:', {
      count: onlineUsers.length
    });

    res.json({
      users: onlineUsers.map(user => ({
        ...user,
        isOnline: true
      }))
    });
  } catch (error) {
    console.error('Test 7 - Error fetching online users:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Error getting online users' });
  }
});

// Add new section
router.post('/:userId/sections', auth, async (req, res) => {
  try {
    console.log('Add section request:', {
      userId: req.params.userId,
      title: req.body.title,
      type: req.body.type
    });

    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate input
    if (!req.body.title || typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
      return res.status(400).json({ message: 'Valid section title is required' });
    }

    // Check section limits
    const currentSections = user.profileSections.length;
    const maxSections = user.sectionLimits?.maxMainSections || 10;
    
    if (currentSections >= maxSections) {
      return res.status(400).json({ 
        message: `Cannot add more than ${maxSections} sections`,
        currentCount: currentSections,
        maxAllowed: maxSections
      });
    }

    // Create new section with unique ID
    const newSection = {
      id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title.trim(),
      type: 'custom',
      content: [],
      order: currentSections,
      isVisible: true
    };

    console.log('Creating new section:', newSection);

    // Add section
    user.profileSections.push(newSection);
    await user.save();

    console.log('Section created successfully:', {
      sectionId: newSection.id,
      title: newSection.title
    });

    res.status(201).json(newSection);
  } catch (error) {
    console.error('Error adding section:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Error adding section', 
      details: error.message 
    });
  }
});

// Update section
router.patch('/:userId/sections/:sectionId', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { title, order, isVisible } = req.body;

    // Handle default sections
    if (req.body.type === 'default') {
      const sectionKey = req.params.sectionId;
      if (user.defaultSections[sectionKey]) {
        if (typeof isVisible === 'boolean') {
          user.defaultSections[sectionKey].isVisible = isVisible;
        }
        if (typeof order === 'number') {
          user.defaultSections[sectionKey].order = order;
        }
      }
    } else {
      // Handle custom sections
      const sectionIndex = user.profileSections.findIndex(s => s.id === req.params.sectionId);
      if (sectionIndex === -1) {
        return res.status(404).json({ message: 'Section not found' });
      }

      if (title) user.profileSections[sectionIndex].title = title;
      if (typeof order === 'number') user.profileSections[sectionIndex].order = order;
      if (typeof isVisible === 'boolean') user.profileSections[sectionIndex].isVisible = isVisible;
    }

    await user.save();
    res.json(user.getProfileSections());
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Error updating section', details: error.message });
  }
});

// Delete section
router.delete('/:userId/sections/:sectionId', auth, async (req, res) => {
  try {
    console.log('Delete section request:', {
      userId: req.params.userId,
      sectionId: req.params.sectionId,
      authUserId: req.user.userId
    });

    // Verify user authorization
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find section index
    const sectionIndex = user.profileSections.findIndex(section => section.id === req.params.sectionId);
    
    console.log('Section search result:', {
      sectionFound: sectionIndex !== -1,
      sectionIndex,
      totalSections: user.profileSections.length
    });

    if (sectionIndex === -1) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Check if trying to delete personality section
    const section = user.profileSections[sectionIndex];
    if (section.type === 'personality' && section.id === 'personality') {
      return res.status(403).json({ error: 'Cannot delete personality section' });
    }

    // Remove section
    user.profileSections.splice(sectionIndex, 1);
    await user.save();

    // Get updated sections
    const updatedSections = await user.getProfileSections();

    console.log('Section deleted successfully:', {
      deletedSectionId: req.params.sectionId,
      remainingSections: updatedSections.length
    });

    res.json({ 
      message: 'Section deleted successfully',
      sections: updatedSections 
    });
  } catch (error) {
    console.error('Error deleting section:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      sectionId: req.params.sectionId
    });
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Add content to section
router.post('/:userId/sections/:sectionId/content', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const section = user.profileSections.find(s => s.id === req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Check content limits
    if (section.content.length >= user.sectionLimits.maxSubSections) {
      return res.status(400).json({ 
        message: `Cannot add more than ${user.sectionLimits.maxSubSections} items to a section` 
      });
    }

    const newContent = {
      id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title || 'New Item',
      order: section.content.length,
      description: req.body.description || '',
      value: req.body.value,
      contentType: req.body.contentType || 'text'
    };

    section.content.push(newContent);
    await user.save();

    res.json(newContent);
  } catch (error) {
    console.error('Error adding content:', error);
    res.status(500).json({ message: 'Error adding content', details: error.message });
  }
});

// Update content
router.patch('/:userId/sections/:sectionId/content/:contentId', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const section = user.profileSections.find(s => s.id === req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const contentIndex = section.content.findIndex(c => c.id === req.params.contentId);
    if (contentIndex === -1) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const { title, description, value, order, contentType } = req.body;
    const content = section.content[contentIndex];

    if (title) content.title = title;
    if (description) content.description = description;
    if (value !== undefined) content.value = value;
    if (typeof order === 'number') content.order = order;
    if (contentType) content.contentType = contentType;

    await user.save();
    res.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Error updating content', details: error.message });
  }
});

// Delete content
router.delete('/:userId/sections/:sectionId/content/:contentId', auth, async (req, res) => {
  try {
    console.log('Delete content request:', {
      userId: req.params.userId,
      sectionId: req.params.sectionId,
      contentId: req.params.contentId
    });

    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the section
    const section = user.profileSections.find(s => s.id === req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Prevent deletion of the main personality overview content
    if (section.type === 'personality' && section.id === 'personality' && 
        section.content.length === 1 && section.content[0].id === 'overview') {
      return res.status(400).json({ message: 'Cannot delete the main personality overview' });
    }

    // Remove the content
    const contentExists = section.content.some(c => c.id === req.params.contentId);
    if (!contentExists) {
      return res.status(404).json({ message: 'Content not found' });
    }

    section.content = section.content.filter(c => c.id !== req.params.contentId);
    await user.save();

    console.log('Content deleted successfully');
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Error deleting content', details: error.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate AI Story
router.post('/:userId/generate-story', auth, async (req, res) => {
  try {
    console.log('Generate story request:', {
      userId: req.params.userId,
      authUserId: req.user.userId
    });

    // Verify user authorization
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to generate story for this user' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get test results and calculate weighted type
    const weightedResult = await TestResult.calculateWeightedType(req.params.userId);
    if (!weightedResult) {
      return res.status(400).json({ error: 'No test results found' });
    }

    console.log('Generating AI story with weighted result:', {
      type: weightedResult.type,
      hasTraitStrengths: !!weightedResult.traitStrengths,
      hasTestBreakdown: !!weightedResult.testBreakdown
    });

    // Generate AI story
    const story = await user.generateAIStory();
    if (!story) {
      return res.status(500).json({ error: 'Failed to generate story' });
    }

    console.log('AI story generated successfully:', {
      storyLength: story.length
    });

    // Create new section with unique ID
    const timestamp = Date.now();
    const newSection = {
      id: `ai-story-${timestamp}`,
      title: `Your Personality Deep Dive (${new Date().toLocaleDateString()})`,
      type: 'custom',
      content: [{
        id: `story-${timestamp}`,
        title: 'AI Generated Analysis',
        description: story,
        contentType: 'text'
      }],
      order: user.profileSections.length,
      isVisible: true
    };

    // Add new section
    user.profileSections.push(newSection);
    await user.save();

    console.log('New section added:', {
      sectionId: newSection.id,
      contentId: newSection.content[0].id
    });

    // Get updated sections
    const updatedSections = await user.getProfileSections();

    res.json({ 
      message: 'Story generated successfully',
      sections: updatedSections,
      newSection: newSection
    });
  } catch (error) {
    console.error('Error generating story:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    res.status(500).json({ 
      error: 'Failed to generate story',
      details: error.message
    });
  }
});

// Debug endpoint for story generation
router.get('/debug/story/:userId', auth, async (req, res) => {
  try {
    console.log('Debug story generation for user:', req.params.userId);
    
    // Check Mistral client
    console.log('Mistral client status:', {
      initialized: !!mistralClient,
      hasApiKey: !!process.env.MISTRAL_API_KEY
    });
    
    // Get test results
    const testResults = await TestResult.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(1);
      
    console.log('Test results found:', {
      count: testResults?.length,
      result: testResults[0] ? {
        id: testResults[0]._id,
        type: testResults[0].result?.type,
        percentages: testResults[0].result?.percentages,
        dominantTraits: testResults[0].result?.dominantTraits
      } : null
    });
    
    res.json({
      mistralStatus: {
        initialized: !!mistralClient,
        hasApiKey: !!process.env.MISTRAL_API_KEY
      },
      testResults: testResults[0] ? {
        id: testResults[0]._id,
        type: testResults[0].result?.type,
        hasPercentages: !!testResults[0].result?.percentages,
        hasDominantTraits: !!testResults[0].result?.dominantTraits
      } : null
    });
  } catch (error) {
    console.error('Error in story generation debug:', error);
    res.status(500).json({ message: 'Error in story generation debug' });
  }
});

// Add debug endpoint
router.get('/debug', auth, async (req, res) => {
  try {
    const routes = router.stack
      .filter(r => r.route)
      .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }));

    res.json({
      message: 'Users router debug information',
      routes,
      userId: req.user.userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sorted users (admin only)
router.get('/sorted', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar roles status lastActive positivePercentage totalVotes badges')
      .lean();

    console.log('Fetched users for admin dashboard:', {
      count: users.length,
      fields: Object.keys(users[0] || {})
    });

    res.json(users);
  } catch (error) {
    console.error('Error getting sorted users:', error);
    res.status(500).json({ message: 'Error getting users' });
  }
});

// Make user an admin
router.post('/make-admin', auth, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.roles.includes('admin')) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.roles.push('admin');
    await user.save();

    res.json({ 
      message: 'User successfully made admin',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Error making user admin' });
  }
});

// Admin dashboard route
router.get('/admin/list', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId).select('roles');
    if (!user?.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Only admins can access this route' });
    }

    const users = await User.find({})
      .select('username email avatar roles status lastActive mbtiType badges')
      .lean();

    // Add rating information for each user
    const usersWithRatings = await Promise.all(users.map(async (user) => {
      const totalVotes = (user.upvotes || 0) + (user.downvotes || 0);
      const positivePercentage = totalVotes > 0 
        ? Math.round((user.upvotes || 0) * 100 / totalVotes) 
        : 0;

      return {
        ...user,
        totalVotes,
        positivePercentage,
        badges: user.badges || []
      };
    }));

    res.json({ users: usersWithRatings });
  } catch (error) {
    console.error('Error getting admin user list:', error);
    res.status(500).json({ message: 'Error getting user list' });
  }
});

// Delete user (admin only)
router.delete('/admin/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId).select('roles');
    if (!adminUser?.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const userToDelete = await User.findById(req.params.userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's test results
    await TestResult.deleteMany({ user: userToDelete._id });

    // Delete the user
    await User.deleteOne({ _id: userToDelete._id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Reset user ratings (admin only)
router.post('/admin/:userId/reset-ratings', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId).select('roles');
    if (!adminUser?.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Only admins can reset ratings' });
    }

    const userToReset = await User.findById(req.params.userId);
    if (!userToReset) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset ratings
    userToReset.upvotes = 0;
    userToReset.downvotes = 0;
    await userToReset.save();

    res.json({ message: 'User ratings reset successfully' });
  } catch (error) {
    console.error('Error resetting user ratings:', error);
    res.status(500).json({ message: 'Error resetting user ratings' });
  }
});

// Enhanced rate user endpoint
router.post('/:userId/rate', auth, async (req, res) => {
  try {
    console.log('Rate user request:', {
      targetUserId: req.params.userId,
      voterId: req.user.userId,
      vote: req.body.vote
    });

    // Prevent self-voting
    if (req.params.userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize ratings if they don't exist
    if (!user.ratings) {
      user.ratings = { upvotes: [], downvotes: [], history: [] };
    }

    const voterId = req.user.userId;
    const { vote } = req.body;
    const now = new Date();

    // Remove any existing votes by this user
    user.ratings.upvotes = user.ratings.upvotes.filter(vote => !vote.user.equals(voterId));
    user.ratings.downvotes = user.ratings.downvotes.filter(vote => !vote.user.equals(voterId));

    // Record vote history
    user.ratings.history.push({
      type: vote || 'remove',
      user: voterId,
      timestamp: now
    });

    // Add new vote if not removing
    if (vote === 'up') {
      user.ratings.upvotes.push({ user: voterId, timestamp: now });
    } else if (vote === 'down') {
      user.ratings.downvotes.push({ user: voterId, timestamp: now });
    }

    // Update badges
    const totalVotes = user.ratings.upvotes.length + user.ratings.downvotes.length;
    const positivePercentage = totalVotes > 0 
      ? (user.ratings.upvotes.length / totalVotes) * 100 
      : 0;

    // Trusted Member badge
    if (totalVotes >= 10 && positivePercentage >= 80) {
      if (!user.badges.some(b => b.type === 'trusted_member' && b.active)) {
        user.badges.push({
          type: 'trusted_member',
          earnedAt: now,
          active: true
        });
      }
    } else {
      // Deactivate badge if criteria no longer met
      user.badges.forEach(badge => {
        if (badge.type === 'trusted_member') {
          badge.active = false;
        }
      });
    }

    // Warning Flag badge
    if (totalVotes >= 20 && positivePercentage < 30) {
      if (!user.badges.some(b => b.type === 'warning_flag' && b.active)) {
        user.badges.push({
          type: 'warning_flag',
          earnedAt: now,
          active: true
        });
      }
    } else {
      user.badges.forEach(badge => {
        if (badge.type === 'warning_flag') {
          badge.active = false;
        }
      });
    }

    await user.save();

    // Return updated rating stats
    res.json({
      upvotes: user.ratings.upvotes.length,
      downvotes: user.ratings.downvotes.length,
      positivePercentage: Math.round(positivePercentage),
      badges: user.badges.filter(b => b.active).map(b => b.type)
    });
  } catch (error) {
    console.error('Error rating user:', error);
    res.status(500).json({ error: 'Failed to rate user' });
  }
});

// Get user's rating with history
router.get('/:userId/rating', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('ratings.history.user', 'username avatar')
      .populate('ratings.upvotes.user', 'username avatar')
      .populate('ratings.downvotes.user', 'username avatar');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter out any votes from deleted users
    if (user.ratings) {
      user.ratings.upvotes = user.ratings.upvotes.filter(vote => vote.user);
      user.ratings.downvotes = user.ratings.downvotes.filter(vote => vote.user);
      user.ratings.history = user.ratings.history.filter(vote => vote.user);
    }

    // Get current user's vote if any
    const currentUserVote = user.ratings?.upvotes?.some(v => v.user?._id.equals(req.user.userId)) ? 'up' :
      user.ratings?.downvotes?.some(v => v.user?._id.equals(req.user.userId)) ? 'down' : null;

    const totalVotes = (user.ratings?.upvotes?.length || 0) + (user.ratings?.downvotes?.length || 0);
    const positivePercentage = totalVotes > 0 
      ? Math.round((user.ratings.upvotes.length / totalVotes) * 100)
      : 0;

    // Get vote history with timestamps
    const voteHistory = user.ratings?.history || [];
    
    // Get active badges
    const activeBadges = user.badges?.filter(b => b.active) || [];

    // Save the filtered ratings
    await user.save();

    res.json({
      upvotes: user.ratings?.upvotes?.length || 0,
      downvotes: user.ratings?.downvotes?.length || 0,
      positivePercentage,
      currentUserVote,
      history: voteHistory.map(vote => ({
        type: vote.type,
        user: vote.user ? {
          username: vote.user.username,
          avatar: vote.user.avatar
        } : null,
        timestamp: vote.timestamp
      })),
      badges: activeBadges.map(b => ({
        type: b.type,
        earnedAt: b.earnedAt
      }))
    });
  } catch (error) {
    console.error('Error getting user rating:', error);
    res.status(500).json({ error: 'Failed to get user rating' });
  }
});

module.exports = router; 