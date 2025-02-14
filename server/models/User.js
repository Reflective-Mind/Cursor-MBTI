const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  mbtiType: {
    type: String,
    enum: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
           'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
    required: false
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  personalityTraits: [{
    trait: String,
    strength: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  interests: [{
    type: String,
    trim: true
  }],
  favoriteQuote: {
    text: String,
    author: String
  },
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  location: {
    city: String,
    country: String
  },
  occupation: String,
  education: String,
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'native']
    }
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  roles: [{
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  }],
  theme: {
    primaryColor: {
      type: String,
      default: '#2196f3'
    },
    accentColor: {
      type: String,
      default: '#f50057'
    },
    layout: {
      type: String,
      enum: ['classic', 'modern', 'minimal'],
      default: 'classic'
    }
  },
  profileSections: [{
    id: String,
    title: String,
    order: Number,
    isVisible: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: ['default', 'custom'],
      default: 'custom'
    },
    content: [{
      id: String,
      title: String,
      order: Number,
      description: String,
      value: mongoose.Schema.Types.Mixed,
      contentType: {
        type: String,
        enum: ['text', 'list', 'progress', 'link', 'date'],
        default: 'text'
      }
    }]
  }],
  defaultSections: {
    personality: {
      isVisible: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      }
    },
    interests: {
      isVisible: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 1
      }
    },
    languages: {
      isVisible: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 2
      }
    },
    achievements: {
      isVisible: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 3
      }
    }
  },
  sectionLimits: {
    maxMainSections: {
      type: Number,
      default: 10
    },
    maxSubSections: {
      type: Number,
      default: 15
    },
    maxContentLength: {
      type: Number,
      default: 2000
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    avatar: this.avatar,
    status: this.status,
    mbtiType: this.mbtiType,
    bio: this.bio,
    personalityTraits: this.personalityTraits,
    interests: this.interests,
    favoriteQuote: this.favoriteQuote,
    socialLinks: this.socialLinks,
    location: this.location,
    occupation: this.occupation,
    education: this.education,
    languages: this.languages,
    achievements: this.achievements,
    theme: this.theme,
    roles: this.roles,
    joinedAt: this.joinedAt,
    lastActive: this.lastActive
  };
};

// Add method to get profile sections
userSchema.methods.getProfileSections = function() {
  const defaultSections = {
    personality: {
      id: 'personality',
      title: 'Personality',
      type: 'default',
      content: this.personalityTraits.map((trait, index) => ({
        id: `trait-${index}`,
        title: trait.trait,
        value: trait.strength,
        contentType: 'progress'
      }))
    },
    interests: {
      id: 'interests',
      title: 'Interests',
      type: 'default',
      content: this.interests.map((interest, index) => ({
        id: `interest-${index}`,
        title: interest,
        contentType: 'text'
      }))
    },
    languages: {
      id: 'languages',
      title: 'Languages',
      type: 'default',
      content: this.languages.map((lang, index) => ({
        id: `lang-${index}`,
        title: lang.name,
        value: lang.proficiency,
        contentType: 'text'
      }))
    },
    achievements: {
      id: 'achievements',
      title: 'Achievements',
      type: 'default',
      content: this.achievements.map((achievement, index) => ({
        id: `achievement-${index}`,
        title: achievement.title,
        description: achievement.description,
        value: achievement.date,
        contentType: 'date'
      }))
    }
  };

  // Combine default and custom sections, respecting visibility and order
  const allSections = [
    ...Object.entries(defaultSections)
      .filter(([key]) => this.defaultSections[key]?.isVisible)
      .map(([key, section]) => ({
        ...section,
        order: this.defaultSections[key].order
      })),
    ...this.profileSections
      .filter(section => section.isVisible)
  ].sort((a, b) => a.order - b.order);

  return allSections;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 