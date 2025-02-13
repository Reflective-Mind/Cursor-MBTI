const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 32
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'announcement'],
    default: 'text'
  },
  category: {
    type: String,
    enum: ['general', 'mbti-types', 'interests', 'support'],
    default: 'general'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roles: [{
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  allowedMbtiTypes: [{
    type: String,
    enum: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
           'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
  }],
  slowMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    delay: {
      type: Number,
      default: 0 // seconds
    }
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
channelSchema.index({ category: 1, name: 1 });
channelSchema.index({ 'members.user': 1 });
channelSchema.index({ allowedMbtiTypes: 1 });

// Method to get channel details
channelSchema.methods.getChannelInfo = async function() {
  await this.populate('members.user', 'username avatar status');
  await this.populate('pinnedMessages');
  
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    type: this.type,
    category: this.category,
    isPrivate: this.isPrivate,
    members: this.members.map(member => ({
      user: member.user.getPublicProfile(),
      roles: member.roles,
      joinedAt: member.joinedAt
    })),
    allowedMbtiTypes: this.allowedMbtiTypes,
    slowMode: this.slowMode,
    pinnedMessages: this.pinnedMessages,
    lastActivity: this.lastActivity,
    createdAt: this.createdAt
  };
};

// Method to check if a user is a member
channelSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if a user has specific role
channelSchema.methods.hasRole = function(userId, role) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.roles.includes(role) : false;
};

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel; 