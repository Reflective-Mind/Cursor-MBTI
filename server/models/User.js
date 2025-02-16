const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const contentSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: mongoose.Schema.Types.Mixed,
  contentType: {
    type: String,
    enum: ['text', 'traits', 'breakdown']
  }
}, { _id: false });

const profileSectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: {
    type: String,
    enum: ['default', 'personality', 'interests', 'languages', 'achievements', 'custom']
  },
  content: [contentSchema],
  order: Number,
  isVisible: {
    type: Boolean,
    default: true
  }
}, { _id: false });

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
  profileSections: [profileSectionSchema],
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
  try {
    // Log initial state
    console.log('Starting password comparison for user:', {
      id: this._id,
      email: this.email,
      hasPassword: !!this.password,
      candidateLength: candidatePassword?.length,
      passwordLength: this.password?.length,
      timestamp: new Date().toISOString()
    });
    
    // Validate stored password
    if (!this.password) {
      const error = new Error('No password hash stored for user');
      error.code = 'NO_PASSWORD_HASH';
      throw error;
    }
    
    // Validate candidate password
    if (!candidatePassword) {
      const error = new Error('No candidate password provided');
      error.code = 'NO_CANDIDATE_PASSWORD';
      throw error;
    }

    // Ensure password is a string
    const passwordString = candidatePassword.toString();
    
    // Log before bcrypt comparison
    console.log('Attempting bcrypt compare:', {
      userId: this._id,
      email: this.email,
      candidateLength: passwordString.length,
      storedHashLength: this.password.length,
      timestamp: new Date().toISOString()
    });

    // Perform comparison
    const isMatch = await bcrypt.compare(passwordString, this.password);
    
    // Log result
    console.log('Password comparison completed:', {
      userId: this._id,
      email: this.email,
      isMatch: isMatch,
      candidateLength: passwordString.length,
      storedHashLength: this.password.length,
      timestamp: new Date().toISOString()
    });
    
    return isMatch;
  } catch (error) {
    // Log detailed error information
    console.error('Password comparison error:', {
      userId: this._id,
      email: this.email,
      errorCode: error.code,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Rethrow with more context
    const enhancedError = new Error(`Password comparison failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.code = error.code;
    throw enhancedError;
  }
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
    lastActive: this.lastActive,
    profileSections: this.profileSections
  };
};

// Method to get profile sections
userSchema.methods.getProfileSections = async function(weightedResult) {
  const TestResult = mongoose.model('TestResult');
  
  // If no weighted result provided, calculate it
  if (!weightedResult) {
    weightedResult = await TestResult.calculateWeightedType(this._id);
  }

  // Define default sections with proper structure
  const defaultSections = [{
    id: 'personality',
    title: weightedResult ? weightedResult.profileTitle : 'Personality Profile',
    type: 'personality',
    content: [
      {
        id: 'overview',
        title: 'Personality Overview',
        description: weightedResult ? generatePersonalityOverview(weightedResult) : 'Take a personality test to see your results',
        contentType: 'text'
      },
      {
        id: 'trait-strengths',
        title: 'Trait Strengths',
        description: weightedResult ? formatTraitStrengths(weightedResult) : null,
        contentType: 'traits'
      },
      {
        id: 'test-breakdown',
        title: 'Test Results Breakdown',
        description: weightedResult ? formatTestBreakdown(weightedResult) : null,
        contentType: 'breakdown'
      }
    ],
    order: this.defaultSections.personality.order,
    isVisible: this.defaultSections.personality.isVisible
  }];

  return defaultSections;
};

function generatePersonalityOverview(weightedResult) {
  const { type, dominantTraits, percentages, isBalanced } = weightedResult;
  
  // Get personality descriptions
  const descriptions = {
    E: 'Extroverted - Energized by social interaction',
    I: 'Introverted - Energized by solitary activities',
    S: 'Sensing - Focuses on concrete facts and details',
    N: 'Intuitive - Focuses on patterns and possibilities',
    T: 'Thinking - Makes decisions based on logic',
    F: 'Feeling - Makes decisions based on values',
    J: 'Judging - Prefers structure and planning',
    P: 'Perceiving - Prefers flexibility and spontaneity'
  };

  // Generate overview text
  let overview = `Based on your weighted test results, you are ${isBalanced ? 'a balanced' : 'primarily'} ${type} personality type.\n\n`;
  overview += 'Your dominant traits are:\n';
  
  // Add dominant traits with percentages
  Object.entries(dominantTraits).forEach(([category, trait]) => {
    const traitLetter = trait[0];
    const percentage = percentages[traitLetter];
    overview += `• ${descriptions[traitLetter]} (${percentage}%)\n`;
  });

  return overview;
}

function formatTraitStrengths(weightedResult) {
  const { traitStrengths, percentages } = weightedResult;
  
  return {
    pairs: [
      {
        trait1: { letter: 'E', score: percentages.E },
        trait2: { letter: 'I', score: percentages.I },
        strength: traitStrengths.EI
      },
      {
        trait1: { letter: 'S', score: percentages.S },
        trait2: { letter: 'N', score: percentages.N },
        strength: traitStrengths.SN
      },
      {
        trait1: { letter: 'T', score: percentages.T },
        trait2: { letter: 'F', score: percentages.F },
        strength: traitStrengths.TF
      },
      {
        trait1: { letter: 'J', score: percentages.J },
        trait2: { letter: 'P', score: percentages.P },
        strength: traitStrengths.JP
      }
    ]
  };
}

function formatTestBreakdown(weightedResult) {
  const { testBreakdown } = weightedResult;
  
  return {
    tests: testBreakdown.map(test => ({
      category: test.category,
      type: test.type,
      baseWeight: test.baseWeight,
      effectiveWeight: test.effectiveWeight,
      date: test.date,
      percentages: test.percentages
    }))
  };
}

const User = mongoose.model('User', userSchema);

module.exports = User; 