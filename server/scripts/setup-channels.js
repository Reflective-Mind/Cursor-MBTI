const mongoose = require('mongoose');
const Channel = require('../models/Channel');
require('dotenv').config();

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

async function setupChannels() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Setting up default channels...');
    for (const channelData of defaultChannels) {
      const existingChannel = await Channel.findOne({ name: channelData.name });
      if (!existingChannel) {
        const channel = new Channel(channelData);
        await channel.save();
        console.log(`Created channel: ${channelData.name}`);
      } else {
        console.log(`Channel already exists: ${channelData.name}`);
      }
    }

    console.log('Default channels setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up channels:', error);
    process.exit(1);
  }
}

setupChannels(); 