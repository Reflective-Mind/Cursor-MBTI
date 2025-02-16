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

  const defaultSections = [];
  
  if (weightedResult) {
    // Format trait strengths for better display
    const traitAnalysis = {
      EI: {
        dominant: weightedResult.percentages.E > weightedResult.percentages.I ? 'Extroversion' : 'Introversion',
        strength: Math.abs(weightedResult.percentages.E - weightedResult.percentages.I),
        description: weightedResult.percentages.E > weightedResult.percentages.I ?
          `Prefers social interaction and external engagement (${weightedResult.percentages.E}% E)` :
          `Values internal reflection and personal space (${weightedResult.percentages.I}% I)`
      },
      SN: {
        dominant: weightedResult.percentages.S > weightedResult.percentages.N ? 'Sensing' : 'Intuition',
        strength: Math.abs(weightedResult.percentages.S - weightedResult.percentages.N),
        description: weightedResult.percentages.S > weightedResult.percentages.N ?
          `Focuses on concrete facts and practical details (${weightedResult.percentages.S}% S)` :
          `Sees patterns and explores possibilities (${weightedResult.percentages.N}% N)`
      },
      TF: {
        dominant: weightedResult.percentages.T > weightedResult.percentages.F ? 'Thinking' : 'Feeling',
        strength: Math.abs(weightedResult.percentages.T - weightedResult.percentages.F),
        description: weightedResult.percentages.T > weightedResult.percentages.F ?
          `Makes decisions through logical analysis (${weightedResult.percentages.T}% T)` :
          `Considers human impact in decisions (${weightedResult.percentages.F}% F)`
      },
      JP: {
        dominant: weightedResult.percentages.J > weightedResult.percentages.P ? 'Judging' : 'Perceiving',
        strength: Math.abs(weightedResult.percentages.J - weightedResult.percentages.P),
        description: weightedResult.percentages.J > weightedResult.percentages.P ?
          `Prefers structure and planning (${weightedResult.percentages.J}% J)` :
          `Values flexibility and adaptability (${weightedResult.percentages.P}% P)`
      }
    };

    defaultSections.push({
      id: 'personality',
      title: weightedResult.profileTitle,
      type: 'personality',
      content: [
        {
          id: 'overview',
          title: 'Personality Overview',
          description: generatePersonalityOverview(weightedResult),
          contentType: 'text'
        },
        {
          id: 'trait-strengths',
          title: 'Trait Analysis',
          description: traitAnalysis,
          contentType: 'traits'
        },
        {
          id: 'test-breakdown',
          title: 'Test History',
          description: weightedResult.testBreakdown,
          contentType: 'breakdown'
        }
      ],
      order: this.defaultSections?.personality?.order || 0,
      isVisible: this.defaultSections?.personality?.isVisible !== false
    });
  }

  if (this.profileSections && this.profileSections.length > 0) {
    const customSections = this.profileSections.filter(section => 
      section.type !== 'personality' && section.id !== 'personality'
    );
    defaultSections.push(...customSections);
  }

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

    const weightedResult = await TestResult.calculateWeightedType(this._id);
    if (!weightedResult) {
      throw new Error('Could not calculate weighted personality type');
    }

    const { type, percentages } = weightedResult;
    const allAnswers = results.flatMap(result => result.answers || []);
    
    const answersByCategory = {
      EI: allAnswers.filter(a => a.category === 'EI'),
      SN: allAnswers.filter(a => a.category === 'SN'),
      TF: allAnswers.filter(a => a.category === 'TF'),
      JP: allAnswers.filter(a => a.category === 'JP')
    };

    let story = `This individual has a distinct ${type} personality profile. `;

    // Core personality analysis
    const traits = [];

    // E/I Analysis
    if (percentages.E > percentages.I) {
      const socialAnswers = answersByCategory.EI.filter(a => a.answer === 'E');
      traits.push(`They are energized by social interaction (${percentages.E}% Extroverted), particularly ${
        socialAnswers.length > 0 ? 
        'showing enthusiasm for ' + socialAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'in collaborative and group settings'
      }`);
    } else {
      const introvertAnswers = answersByCategory.EI.filter(a => a.answer === 'I');
      traits.push(`They find strength in introspection (${percentages.I}% Introverted), particularly ${
        introvertAnswers.length > 0 ?
        'valuing ' + introvertAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'appreciating time for internal processing'
      }`);
    }

    // S/N Analysis
    if (percentages.S > percentages.N) {
      const sensingAnswers = answersByCategory.SN.filter(a => a.answer === 'S');
      traits.push(`Their practical mindset (${percentages.S}% Sensing) is evident in ${
        sensingAnswers.length > 0 ?
        'their approach to ' + sensingAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'their focus on concrete facts and real-world applications'
      }`);
    } else {
      const intuitionAnswers = answersByCategory.SN.filter(a => a.answer === 'N');
      traits.push(`Their intuitive nature (${percentages.N}% Intuitive) shines through in ${
        intuitionAnswers.length > 0 ?
        'their way of ' + intuitionAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'their ability to see patterns and future possibilities'
      }`);
    }

    // T/F Analysis
    if (percentages.T > percentages.F) {
      const thinkingAnswers = answersByCategory.TF.filter(a => a.answer === 'T');
      traits.push(`In decision-making (${percentages.T}% Thinking), they excel at ${
        thinkingAnswers.length > 0 ?
        'applying logic to ' + thinkingAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'analyzing situations objectively and systematically'
      }`);
    } else {
      const feelingAnswers = answersByCategory.TF.filter(a => a.answer === 'F');
      traits.push(`Their decision-making process (${percentages.F}% Feeling) is characterized by ${
        feelingAnswers.length > 0 ?
        'strong consideration of ' + feelingAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'deep awareness of human values and emotional impact'
      }`);
    }

    // J/P Analysis
    if (percentages.J > percentages.P) {
      const judgingAnswers = answersByCategory.JP.filter(a => a.answer === 'J');
      traits.push(`Their structured approach to life (${percentages.J}% Judging) is demonstrated through ${
        judgingAnswers.length > 0 ?
        'their preference for ' + judgingAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'their systematic and organized way of handling tasks'
      }`);
    } else {
      const perceivingAnswers = answersByCategory.JP.filter(a => a.answer === 'P');
      traits.push(`Their adaptable nature (${percentages.P}% Perceiving) is reflected in ${
        perceivingAnswers.length > 0 ?
        'their enjoyment of ' + perceivingAnswers.map(a => a.question?.toLowerCase()).filter(q => q).join(' and ') :
        'their flexible and spontaneous approach to life'
      }`);
    }

    // Combine traits into a flowing narrative
    story += traits.join('. ') + '.';

    // Add unique combinations insight if present
    const uniqueCombinations = [];
    if (percentages.E > percentages.I && percentages.F > percentages.T) {
      uniqueCombinations.push("Their combination of extroversion and emotional awareness makes them particularly skilled at building and maintaining meaningful relationships");
    }
    if (percentages.S > percentages.N && percentages.J > percentages.P) {
      uniqueCombinations.push("Their practical mindset combined with organizational skills enables them to effectively turn plans into reality");
    }
    if (percentages.N > percentages.S && percentages.F > percentages.T) {
      uniqueCombinations.push("Their intuitive understanding of patterns combined with emotional intelligence gives them unique insight into human dynamics");
    }

    if (uniqueCombinations.length > 0) {
      story += "\n\nNotable characteristics: " + uniqueCombinations.join(". ") + ".";
    }

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