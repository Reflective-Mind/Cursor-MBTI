require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Channel = require('./models/Channel');
const bcrypt = require('bcryptjs');

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Fix user account
    let user = await User.findOne({email: 'eideken@hotmail.com'});
    if (user) {
      console.log('Found user:', user.email);
    } else {
      console.log('User not found, creating new user...');
      user = new User({
        email: 'eideken@hotmail.com',
        username: 'eideken',
        roles: ['admin', 'user'],
        mbtiType: 'INTP',
        ratings: {
          upvotes: [],
          downvotes: [],
          positivePercentage: 0,
          history: []
        }
      });
    }

    // Update user password and settings
    const password = 'sword91';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    
    // Initialize ratings as arrays if they don't exist
    if (!user.ratings) {
      user.ratings = {
        upvotes: [],
        downvotes: [],
        positivePercentage: 0,
        history: []
      };
    } else {
      // Convert existing ratings to arrays if they're not already
      if (!Array.isArray(user.ratings.upvotes)) {
        user.ratings.upvotes = [];
      }
      if (!Array.isArray(user.ratings.downvotes)) {
        user.ratings.downvotes = [];
      }
      if (!Array.isArray(user.ratings.history)) {
        user.ratings.history = [];
      }
    }

    // Ensure user has admin role and MBTI type
    if (!user.roles.includes('admin')) {
      user.roles = ['admin', 'user'];
    }
    if (!user.mbtiType) {
      user.mbtiType = 'INTP';
    }
    
    await user.save();
    console.log('Updated user password, ratings, roles, and MBTI type');

    // 2. Create default channels if they don't exist
    const defaultChannels = [
      {
        name: 'general',
        description: 'General discussion for all MBTI types',
        type: 'text',
        category: 'general',
        isPrivate: false
      },
      {
        name: 'introvert-corner',
        description: 'A cozy space for introverts to connect',
        type: 'text',
        category: 'mbti-types',
        isPrivate: false,
        allowedMbtiTypes: ['INTJ', 'INTP', 'INFJ', 'INFP', 'ISTJ', 'ISFJ', 'ISTP', 'ISFP']
      },
      {
        name: 'extrovert-plaza',
        description: 'High-energy discussions for extroverts',
        type: 'text',
        category: 'mbti-types',
        isPrivate: false,
        allowedMbtiTypes: ['ENTJ', 'ENTP', 'ENFJ', 'ENFP', 'ESTJ', 'ESFJ', 'ESTP', 'ESFP']
      },
      {
        name: 'intuitive-insights',
        description: 'Deep discussions for intuitive types',
        type: 'text',
        category: 'mbti-types',
        isPrivate: false,
        allowedMbtiTypes: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP']
      },
      {
        name: 'sensor-space',
        description: 'Practical discussions for sensing types',
        type: 'text',
        category: 'mbti-types',
        isPrivate: false,
        allowedMbtiTypes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
      },
      {
        name: 'announcements',
        description: 'Important updates and announcements',
        type: 'announcement',
        category: 'general',
        isPrivate: false
      },
      {
        name: 'support',
        description: 'Get help with MBTI-related questions',
        type: 'text',
        category: 'support',
        isPrivate: false
      }
    ];

    console.log('Setting up default channels...');
    for (const channelData of defaultChannels) {
      const existingChannel = await Channel.findOne({ name: channelData.name });
      if (!existingChannel) {
        const channel = new Channel(channelData);
        await channel.save();
        console.log(`Created channel: ${channelData.name}`);
      } else {
        console.log(`Channel exists: ${channelData.name}`);
      }

      // Add user to channel if not already a member
      if (user) {
        const channel = existingChannel || await Channel.findOne({ name: channelData.name });
        const isMember = channel.members.some(member => 
          member.user.toString() === user._id.toString()
        );
        
        if (!isMember) {
          channel.members.push({
            user: user._id,
            roles: ['member'],
            joinedAt: new Date(),
            lastRead: new Date()
          });
          await channel.save();
          console.log(`Added user to channel: ${channelData.name}`);
        }
      }
    }

    // 3. List all channels
    const channels = await Channel.find({});
    console.log('\nAll channels:', channels.map(c => ({
      name: c.name,
      memberCount: c.members?.length || 0,
      isPrivate: c.isPrivate
    })));

    // 4. List all users
    const users = await User.find({}).select('-password');
    console.log('\nAll users:', users.map(u => ({
      email: u.email,
      roles: u.roles,
      mbtiType: u.mbtiType
    })));

    console.log('\nDatabase fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDatabase(); 