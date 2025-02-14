const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Test 8 - Fetching current user profile:', {
      userId: req.user.userId
    });

    const user = await User.findById(req.user.userId)
      .select('-password -__v')
      .lean();

    if (!user) {
      console.log('Test 8 - Current user not found:', {
        userId: req.user.userId
      });
      return res.status(404).json({ message: 'User not found' });
    }

    // Add online status and last active time
    user.isOnline = user.status === 'online';
    user.lastActive = user.lastActive || new Date();

    console.log('Test 8 - Current user profile found:', {
      username: user.username,
      mbtiType: user.mbtiType,
      isOnline: user.isOnline,
      lastActive: user.lastActive
    });

    res.json(user);
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
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check section limits
    const totalSections = user.profileSections.length + 
      Object.values(user.defaultSections).filter(s => s.isVisible).length;
    
    if (totalSections >= user.sectionLimits.maxMainSections) {
      return res.status(400).json({ 
        message: `Cannot add more than ${user.sectionLimits.maxMainSections} sections` 
      });
    }

    const newSection = {
      id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title || 'New Section',
      order: totalSections,
      isVisible: true,
      type: 'custom',
      content: []
    };

    user.profileSections.push(newSection);
    await user.save();

    res.json(newSection);
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ message: 'Error adding section', details: error.message });
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
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this profile' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot delete default sections
    const section = user.profileSections.find(s => s.id === req.params.sectionId);
    if (!section || section.type === 'default') {
      return res.status(400).json({ message: 'Cannot delete this section' });
    }

    user.profileSections = user.profileSections.filter(s => s.id !== req.params.sectionId);
    await user.save();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Error deleting section', details: error.message });
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

    section.content = section.content.filter(c => c.id !== req.params.contentId);
    await user.save();

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Error deleting content', details: error.message });
  }
});

module.exports = router; 