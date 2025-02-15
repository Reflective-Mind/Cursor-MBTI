const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const TestResult = require('../models/TestResult');
const path = require('path');

console.log('Initializing users router');

// Initialize Mistral client if API key is available
let mistralClient;

const initializeMistralClient = async () => {
  try {
    const envCheckResult = {
      hasApiKey: !!process.env.MISTRAL_API_KEY,
      apiKeyLength: process.env.MISTRAL_API_KEY?.length,
      envVars: {
        NODE_ENV: process.env.NODE_ENV,
        PWD: process.cwd(),
        SERVER_DIR: __dirname,
        ENV_FILE: path.join(__dirname, '../.env')
      }
    };

    console.log('Mistral client initialization check:', envCheckResult);

    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY is not defined in environment variables.', {
        envPath: path.join(__dirname, '../.env'),
        availableEnvVars: Object.keys(process.env).filter(key => !key.includes('KEY')).join(', ')
      });
      return null;
    }

    // Import Mistral client using dynamic import
    const { default: Mistral } = await import('@mistralai/mistralai');
    
    // Create client instance with proper configuration
    const client = new Mistral(process.env.MISTRAL_API_KEY);

    // Test the client with a simple request
    try {
      console.log('Testing Mistral client connection...');
      const models = await client.listModels();
      console.log('Successfully tested Mistral client connection:', {
        availableModels: models.data?.map(m => m.id) || []
      });
    } catch (testError) {
      console.error('Failed to test Mistral client:', {
        error: testError.message,
        stack: testError.stack,
        type: testError.constructor.name
      });
      return null;
    }

    console.log('Users Router: Mistral AI client initialized successfully', {
      clientExists: !!client,
      timestamp: new Date().toISOString(),
      apiKeyLength: process.env.MISTRAL_API_KEY.length
    });

    return client;
  } catch (error) {
    console.error('Users Router: Failed to initialize Mistral AI client:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
      apiKeyExists: !!process.env.MISTRAL_API_KEY,
      apiKeyLength: process.env.MISTRAL_API_KEY?.length
    });
    return null;
  }
};

// Initialize Mistral client immediately and wait for it
(async () => {
  try {
    console.log('Starting Mistral client initialization...');
    mistralClient = await initializeMistralClient();
    if (mistralClient) {
      console.log('Mistral client initialized successfully on router startup');
    } else {
      console.error('Failed to initialize Mistral client on router startup');
    }
  } catch (error) {
    console.error('Error during initial Mistral client initialization:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
  }
})();

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

// Generate AI story
router.post('/:userId/generate-story', auth, async (req, res) => {
  try {
    console.log('Generate story request:', {
      paramsUserId: req.params.userId,
      authUserId: req.user.userId,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      mistralInitialized: !!mistralClient,
      envVars: {
        hasApiKey: !!process.env.MISTRAL_API_KEY,
        apiKeyLength: process.env.MISTRAL_API_KEY?.length,
        nodeEnv: process.env.NODE_ENV
      }
    });

    // Initialize Mistral client if not already initialized
    if (!mistralClient) {
      console.log('Mistral client not initialized, attempting initialization...');
      const { default: Mistral } = await import('@mistralai/mistralai');
      mistralClient = new Mistral(process.env.MISTRAL_API_KEY);
    }

    if (!mistralClient) {
      const error = new Error('Failed to initialize Mistral client');
      error.details = {
        hasApiKey: !!process.env.MISTRAL_API_KEY,
        apiKeyLength: process.env.MISTRAL_API_KEY?.length,
        envFile: path.join(__dirname, '../.env')
      };
      throw error;
    }

    // Get all user's test results with detailed logging
    console.log('Searching for test results with query:', {
      user: req.params.userId
    });

    const testResults = await TestResult.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    console.log('Found test results:', {
      count: testResults?.length,
      results: testResults.map(result => ({
        id: result._id,
        type: result.result?.type,
        testCategory: result.testCategory,
        hasPercentages: !!result.result?.percentages,
        hasDominantTraits: !!result.result?.dominantTraits,
        createdAt: result.createdAt
      }))
    });

    if (!testResults || testResults.length === 0) {
      return res.status(404).json({ 
        message: 'No test results found. Please complete an MBTI test first.',
        userId: req.params.userId
      });
    }

    // Get user info for personalization
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare test results summary
    const testBreakdown = testResults.map(test => ({
      category: test.testCategory,
      type: test.result.type,
      percentages: test.result.percentages,
      dominantTraits: test.result.dominantTraits,
      date: test.createdAt
    }));

    // Calculate average trait scores across all tests
    const averageTraits = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
      count: testResults.length
    };

    testResults.forEach(test => {
      if (test.result.percentages) {
        Object.entries(test.result.percentages).forEach(([trait, value]) => {
          averageTraits[trait] += value;
        });
      }
    });

    Object.keys(averageTraits).forEach(trait => {
      if (trait !== 'count') {
        averageTraits[trait] = Math.round(averageTraits[trait] / averageTraits.count);
      }
    });

    // Prepare the prompt for AI
    const prompt = `As an advanced MBTI analyst, create a unique and personalized analysis for this user based on their test results:

Test History:
${testBreakdown.map(test => `${test.category}: ${test.type} (Taken: ${new Date(test.date).toLocaleDateString()})`).join('\n')}

Average Trait Percentages:
${Object.entries(averageTraits)
  .filter(([key]) => key !== 'count')
  .map(([trait, value]) => `${trait}: ${value}%`)
  .join('\n')}

Latest Test Dominant Traits:
${Object.entries(testResults[0].result.dominantTraits || {}).map(([category, trait]) => `${category}: ${trait}`).join('\n')}

Create a professional and personal showcase following this exact structure:

1. Profile Title
${testResults[0].result.type} - Professional & Personal Overview

2. Summary Introduction
• Summarize their core MBTI traits based on their specific test scores
• Explain how their individual scores reflect their thought processes and behavior
• Focus on their unique combination of traits and percentages

3. Key Personality Strengths (3-4 bullet points)
• Base each strength on their highest scoring traits from the test data
• Include specific percentages and explain why they are advantageous
• If any traits are balanced (close to 50%), highlight this as a unique strength

4. Areas for Growth (2-3 bullet points)
• Provide constructive improvement suggestions based on their actual test scores
• Make recommendations specific to their MBTI type and score patterns
• Focus on actionable professional development opportunities

5. Test Results Analysis
• Compare results across all tests taken (if multiple tests exist)
• Identify consistent patterns and any variations in scores
• Explain what their score trends might indicate about their type development

6. How Others Can Best Work With Them
• Provide specific communication preferences based on their trait scores
• Include collaboration strategies that leverage their strongest traits
• Add practical tips for effective teamwork based on their type

7. Final Summary for Self-Presentation
Create a concise 1-2 sentence professional summary that captures their key traits and working style.

Important Guidelines:
- Base all insights strictly on their test data and scores
- Keep the tone professional yet engaging
- Focus on practical workplace and personal development applications
- Avoid any fictional elements or storytelling
- Do not make assumptions about gender or personal characteristics
- Use specific percentages and test results to support each point
- Make the analysis unique to their individual score pattern
- Ensure all content is suitable for professional networking

The showcase should be data-driven, practical, and immediately useful for professional development and team collaboration.`;

    console.log('Generating personality showcase with Mistral AI...');
    
    // Generate analysis using Mistral AI
    const response = await mistralClient.chat({
      model: "mistral-tiny",
      messages: [
        { 
          role: "system", 
          content: "You are an expert MBTI analyst and professional development consultant. Your role is to create highly personalized, data-driven personality analyses based on actual test results. Focus on practical workplace applications and professional development. Use clear, structured formatting with bullet points. Avoid any fictional elements or assumptions." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500,
      top_p: 0.9
    });

    console.log('Mistral AI response received:', {
      hasChoices: !!response?.choices,
      firstChoice: !!response?.choices?.[0],
      hasMessage: !!response?.choices?.[0]?.message
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response format');
    }

    const story = response.choices[0].message.content;

    // Check if AI Analysis section already exists
    let aiSection = user.profileSections.find(section => section.type === 'ai_analysis');
    
    if (aiSection) {
      // Update existing section
      aiSection.content = [{
        id: new mongoose.Types.ObjectId().toString(),
        title: `${testResults[0].result.type} Personality Showcase`,
        description: story,
        contentType: 'text'
      }];
    } else {
      // Create new section
      aiSection = {
        id: new mongoose.Types.ObjectId().toString(),
        title: `${testResults[0].result.type} Personality Showcase`,
        order: user.profileSections.length,
        isVisible: true,
        type: 'ai_analysis',
        content: [{
          id: new mongoose.Types.ObjectId().toString(),
          title: `${testResults[0].result.type} Personality Showcase`,
          description: story,
          contentType: 'text'
        }]
      };
      user.profileSections.push(aiSection);
    }

    await user.save();
    console.log('Personality showcase saved to profile:', {
      sectionId: aiSection.id,
      contentLength: story.length,
      type: testResults[0].result.type,
      testCount: testResults.length
    });

    res.json({ 
      story,
      section: aiSection,
      testBreakdown: testBreakdown.map(test => ({
        category: test.category,
        type: test.type,
        date: test.date
      }))
    });
  } catch (error) {
    console.error('Error generating personality showcase:', {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    res.status(500).json({ 
      message: 'Error generating personality showcase',
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

module.exports = router; 