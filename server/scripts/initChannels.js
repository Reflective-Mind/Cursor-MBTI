require('dotenv').config();
const mongoose = require('mongoose');
const Channel = require('../models/Channel');
const User = require('../models/User');

const defaultChannels = [
  {
    name: 'general',
    description: 'General discussion for all MBTI types',
    category: 'general',
    type: 'text'
  },
  {
    name: 'introvert-corner',
    description: 'A cozy space for introverts to connect',
    category: 'mbti-types',
    type: 'text',
    allowedMbtiTypes: ['INTJ', 'INTP', 'INFJ', 'INFP', 'ISTJ', 'ISFJ', 'ISTP', 'ISFP']
  },
  {
    name: 'extrovert-plaza',
    description: 'High-energy discussions for extroverts',
    category: 'mbti-types',
    type: 'text',
    allowedMbtiTypes: ['ENTJ', 'ENTP', 'ENFJ', 'ENFP', 'ESTJ', 'ESFJ', 'ESTP', 'ESFP']
  },
  {
    name: 'analysts',
    description: 'For NT types to discuss theories and systems',
    category: 'mbti-types',
    type: 'text',
    allowedMbtiTypes: ['INTJ', 'INTP', 'ENTJ', 'ENTP']
  },
  {
    name: 'diplomats',
    description: 'For NF types to explore ideas and possibilities',
    category: 'mbti-types',
    type: 'text',
    allowedMbtiTypes: ['INFJ', 'INFP', 'ENFJ', 'ENFP']
  },
  {
    name: 'sentinels',
    description: 'For SJ types to discuss practical matters',
    category: 'mbti-types',
    type: 'text',
    allowedMbtiTypes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ']
  },
  {
    name: 'explorers',
    description: 'For SP types to share experiences',
    category: 'mbti-types',
    type: 'text',
    allowedMbtiTypes: ['ISTP', 'ISFP', 'ESTP', 'ESFP']
  },
  {
    name: 'career-advice',
    description: 'Discuss career paths and professional development',
    category: 'interests',
    type: 'text'
  },
  {
    name: 'relationships',
    description: 'Share experiences and advice about relationships',
    category: 'interests',
    type: 'text'
  },
  {
    name: 'personal-growth',
    description: 'Discuss self-improvement and development',
    category: 'interests',
    type: 'text'
  },
  {
    name: 'announcements',
    description: 'Important updates and announcements',
    category: 'general',
    type: 'announcement'
  },
  {
    name: 'help-desk',
    description: 'Get help with personality type questions',
    category: 'support',
    type: 'text'
  }
];

const initializeChannels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing channels
    await Channel.deleteMany({});
    console.log('Cleared existing channels');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Create new channels
    for (const channelData of defaultChannels) {
      const channel = new Channel({
        ...channelData,
        members: users.map(user => ({
          user: user._id,
          roles: ['member']
        }))
      });
      await channel.save();
      console.log(`Created channel: ${channel.name} with ${channel.members.length} members`);
    }

    console.log('All channels created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing channels:', error);
    process.exit(1);
  }
};

initializeChannels(); 