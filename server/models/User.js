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
  sectionLimits: {
    maxMainSections: {
      type: Number,
      default: 10
    },
    maxSubSections: {
      type: Number,
      default: 20
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

    // Ensure password is a string and trim whitespace
    const passwordString = candidatePassword.toString().trim();
    
    // Log before bcrypt comparison
    console.log('Attempting bcrypt compare:', {
      userId: this._id,
      email: this.email,
      candidateLength: passwordString.length,
      storedHashLength: this.password.length,
      timestamp: new Date().toISOString()
    });

    // Perform comparison with bcrypt
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
    enhancedError.code = error.code || 'PASSWORD_COMPARISON_ERROR';
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
    try {
      weightedResult = await TestResult.calculateWeightedType(this._id);
    } catch (error) {
      console.error('Error calculating weighted type:', {
        userId: this._id,
        error: {
          message: error.message,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      });
      weightedResult = null;
    }
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
      }
    ],
    order: this.defaultSections?.personality?.order || 0,
    isVisible: this.defaultSections?.personality?.isVisible !== false
  }];

  return defaultSections;
};

function generatePersonalityOverview(weightedResult) {
  const { type, dominantTraits, percentages, testBreakdown } = weightedResult;
  
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

  // Calculate total questions answered
  const totalQuestions = testBreakdown.reduce((sum, test) => {
    const questionCounts = {
      'mbti-100': 100,
      'mbti-24': 24,
      'mbti-8': 8
    };
    return sum + questionCounts[test.category];
  }, 0);

  // Generate overview text
  let overview = `Based on your combined test results (${totalQuestions} questions total), you are a ${type} personality type.\n\n`;
  
  if (testBreakdown.length > 1) {
    overview += 'Your results are based on:\n';
    testBreakdown.forEach(test => {
      const date = new Date(test.date).toLocaleDateString();
      overview += `• ${test.category.toUpperCase()} test (${Math.round(test.effectiveWeight)}% contribution) - Taken on ${date}\n`;
    });
    overview += '\n';
  }

  overview += 'Your personality traits are:\n';
  
  // Add traits with percentages
  Object.entries(dominantTraits).forEach(([category, trait]) => {
    const traitLetter = trait[0];
    const percentage = percentages[traitLetter];
    overview += `• ${descriptions[traitLetter]} (${percentage}%)\n`;
  });

  return overview;
}

// Add method to generate AI story
userSchema.methods.generateAIStory = async function() {
  try {
    const TestResult = mongoose.model('TestResult');
    const results = await TestResult.find({ user: this._id }).sort({ createdAt: -1 });
    
    if (!results || results.length === 0) {
      throw new Error('No test results available');
    }

    // Get weighted type and trait strengths
    const weightedResult = await TestResult.calculateWeightedType(this._id);
    if (!weightedResult) {
      throw new Error('Could not calculate weighted personality type');
    }

    const { type, traitStrengths, percentages, testBreakdown } = weightedResult;

    // Calculate total questions answered
    const totalQuestions = results.reduce((sum, result) => {
      return sum + (result.answers ? Object.keys(result.answers).length : 0);
    }, 0);

    // Generate comprehensive story
    let story = `Your Personality Deep Dive\n\n`;
    story += `Based on a comprehensive analysis of your ${totalQuestions} responses across ${results.length} test(s), here's an in-depth look at your personality profile:\n\n`;

    // Core Type Analysis
    story += `Core Personality Type: ${type}\n`;
    story += `Your personality type combines the following core aspects:\n`;
    
    // Add detailed trait analysis
    const categories = ['EI', 'SN', 'TF', 'JP'];
    const traitDescriptions = {
      E: {
        high: 'You are strongly energized by social interaction and external engagement. You think best when sharing ideas with others and prefer collaborative environments.',
        moderate: 'You are comfortable in social situations while also valuing some alone time. You can adapt between group work and solo activities.',
        low: 'While you can engage socially when needed, you prefer smaller groups and may need time alone to recharge.'
      },
      I: {
        high: 'You have a strong preference for internal reflection and deep thinking. You process information best when given time to consider it privately.',
        moderate: 'You balance internal reflection with external engagement well. You can work independently while still maintaining social connections.',
        low: 'While you value introspection, you also recognize the benefits of external input and group interaction.'
      },
      S: {
        high: 'You have a strong focus on concrete facts and practical applications. You trust experience and pay careful attention to details in the present moment.',
        moderate: 'You balance practical considerations with abstract possibilities. You can work with both detailed facts and broader concepts.',
        low: 'While you appreciate concrete information, you also see value in exploring theoretical possibilities.'
      },
      N: {
        high: 'You have a strong preference for patterns and possibilities. You naturally see connections between concepts and enjoy thinking about future implications.',
        moderate: 'You combine intuitive insights with practical considerations. You can work with both abstract ideas and concrete details.',
        low: 'While you enjoy exploring possibilities, you also recognize the importance of practical considerations.'
      },
      T: {
        high: 'You strongly prefer logical analysis and objective criteria in decision-making. You naturally seek consistency and impartial evaluation.',
        moderate: 'You balance logical analysis with consideration of human factors. You can make decisions using both objective and subjective criteria.',
        low: 'While you value logical consistency, you also consider the human impact of decisions.'
      },
      F: {
        high: 'You have a strong focus on personal values and human factors in decision-making. You naturally consider how choices affect others.',
        moderate: 'You combine emotional intelligence with logical consideration. You can make decisions that are both personally meaningful and objectively sound.',
        low: 'While you prioritize human factors, you also appreciate the value of logical analysis.'
      },
      J: {
        high: 'You strongly prefer structure and planning. You like to have things decided and enjoy completing tasks systematically.',
        moderate: 'You balance structure with flexibility. You can work with both planned and spontaneous approaches.',
        low: 'While you appreciate organization, you also see the benefits of remaining flexible and adaptable.'
      },
      P: {
        high: 'You have a strong preference for flexibility and spontaneity. You naturally adapt to new information and prefer keeping options open.',
        moderate: 'You combine adaptability with some degree of structure. You can work with both flexible and organized approaches.',
        low: 'While you value adaptability, you also recognize the benefits of planning and organization.'
      }
    };

    for (const category of categories) {
      const traits = category.split('');
      const strength = traitStrengths[category];
      const dominantTrait = strength > 0 ? traits[0] : traits[1];
      const score = Math.abs(strength);
      
      story += `\n${traits[0]}/${traits[1]} Dimension (${score}% ${dominantTrait}):\n`;
      const level = score >= 70 ? 'high' : score >= 30 ? 'moderate' : 'low';
      story += traitDescriptions[dominantTrait][level] + '\n';
    }

    // Add interaction style analysis
    story += '\nInteraction Style:\n';
    const isExtroverted = percentages.E > percentages.I;
    const isJudging = percentages.J > percentages.P;
    
    if (isExtroverted && isJudging) {
      story += 'You tend to be action-oriented and organized, often taking charge in group situations.\n';
    } else if (isExtroverted && !isJudging) {
      story += 'You are adaptable and energetic, bringing spontaneity and enthusiasm to social situations.\n';
    } else if (!isExtroverted && isJudging) {
      story += 'You prefer structured environments and thoughtful planning, working methodically towards goals.\n';
    } else {
      story += 'You are reflective and flexible, adapting to situations while maintaining your independence.\n';
    }

    // Add learning and communication style
    story += '\nLearning and Communication Style:\n';
    const isSensing = percentages.S > percentages.N;
    const isThinking = percentages.T > percentages.F;
    
    if (isSensing && isThinking) {
      story += 'You learn best through practical experience and prefer clear, factual communication.\n';
    } else if (isSensing && !isThinking) {
      story += 'You appreciate hands-on learning and value personal connection in communication.\n';
    } else if (!isSensing && isThinking) {
      story += 'You enjoy theoretical learning and prefer logical, systematic discussions.\n';
    } else {
      story += 'You learn through exploring possibilities and value authentic, meaningful communication.\n';
    }

    // Add growth recommendations
    story += '\nPersonal Growth Opportunities:\n';
    for (const category of categories) {
      const traits = category.split('');
      const strength = traitStrengths[category];
      const dominantTrait = strength > 0 ? traits[0] : traits[1];
      const recessiveTrait = strength > 0 ? traits[1] : traits[0];
      
      if (Math.abs(strength) > 70) {
        story += `- Consider developing your ${recessiveTrait} side to balance your strong ${dominantTrait} preference\n`;
      } else if (Math.abs(strength) < 30) {
        story += `- Your balanced ${traits[0]}/${traits[1]} approach is an asset. Continue developing both aspects\n`;
      }
    }

    // Add test history
    story += '\nTest History and Development:\n';
    testBreakdown.forEach(test => {
      const date = new Date(test.date).toLocaleDateString();
      story += `- ${test.category} (${Math.round(test.effectiveWeight)}% contribution) taken on ${date}\n`;
      story += `  Result: ${test.type} with notable ${Object.entries(test.percentages)
        .filter(([_, score]) => score >= 70)
        .map(([trait, score]) => `${trait}:${score}%`)
        .join(', ')} preferences\n`;
    });

    return story;
  } catch (error) {
    console.error('Error generating AI story:', {
      userId: this._id,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
};

userSchema.methods.analyzeAnswersForCategory = async function(results, category) {
  const traits = category.split('');
  let analysis = '';
  
  // Collect all answers for this category
  const categoryAnswers = results.flatMap(result => {
    return Object.entries(result.answers || {})
      .filter(([questionId]) => questionId.startsWith(category))
      .map(([_, answer]) => answer);
  });

  if (categoryAnswers.length === 0) {
    return `Not enough data to analyze ${traits[0]}/${traits[1]} preference.`;
  }

  // Calculate preference strength
  const traitCount = categoryAnswers.reduce((count, answer) => {
    return count + (answer === traits[0] ? 1 : -1);
  }, 0);

  const percentage = (traitCount / categoryAnswers.length) * 100;
  const strength = Math.abs(percentage);
  const dominantTrait = percentage > 0 ? traits[0] : traits[1];
  
  // Generate trait-specific analysis
  switch (category) {
    case 'EI':
      if (dominantTrait === 'E') {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Extraversion. Your responses indicate you gain energy from social interaction and external engagement. You tend to think out loud and process information through discussion.`;
      } else {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Introversion. Your responses suggest you recharge through solitude and internal reflection. You prefer to process information internally before sharing your thoughts.`;
      }
      break;
      
    case 'SN':
      if (dominantTrait === 'S') {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Sensing. Your answers indicate you focus on concrete facts and practical applications. You trust experience and pay attention to details in the present moment.`;
      } else {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Intuition. Your responses suggest you look for patterns and possibilities. You enjoy thinking about the future and making connections between concepts.`;
      }
      break;
      
    case 'TF':
      if (dominantTrait === 'T') {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Thinking. Your answers indicate you make decisions based on logical analysis and objective criteria. You value consistency and tend to look at situations impartially.`;
      } else {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Feeling. Your responses suggest you make decisions based on personal values and how they affect others. You consider the human element in situations.`;
      }
      break;
      
    case 'JP':
      if (dominantTrait === 'J') {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Judging. Your answers indicate you prefer structure and planning. You like to have things decided and enjoy completing tasks systematically.`;
      } else {
        analysis = `You show a ${getStrengthLevel(strength)} preference for Perceiving. Your responses suggest you prefer flexibility and spontaneity. You like to keep options open and adapt to new information as it comes.`;
      }
      break;
  }

  return analysis;
};

function getStrengthLevel(percentage) {
  if (percentage >= 70) return 'very strong';
  if (percentage >= 50) return 'strong';
  if (percentage >= 30) return 'moderate';
  return 'slight';
}

const User = mongoose.model('User', userSchema);

module.exports = User; 