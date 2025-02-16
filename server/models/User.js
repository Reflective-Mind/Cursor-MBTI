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
    // Create interaction patterns and growth areas analysis
    const traitAnalysis = [
      {
        title: 'Communication Style',
        trait1: { letter: 'E', score: weightedResult.percentages.E },
        trait2: { letter: 'I', score: weightedResult.percentages.I },
        strength: Math.abs(weightedResult.percentages.E - weightedResult.percentages.I),
        pattern: weightedResult.percentages.E > weightedResult.percentages.I 
          ? 'Thrives in group discussions and collaborative environments'
          : 'Excels in one-on-one interactions and written communication',
        growth: weightedResult.percentages.E > weightedResult.percentages.I
          ? 'Develop active listening and reflection skills'
          : 'Practice initiating conversations and sharing thoughts more readily'
      },
      {
        title: 'Information Processing',
        trait1: { letter: 'S', score: weightedResult.percentages.S },
        trait2: { letter: 'N', score: weightedResult.percentages.N },
        strength: Math.abs(weightedResult.percentages.S - weightedResult.percentages.N),
        pattern: weightedResult.percentages.S > weightedResult.percentages.N
          ? 'Excels at implementing practical solutions and handling details'
          : 'Strong at identifying patterns and generating innovative ideas',
        growth: weightedResult.percentages.S > weightedResult.percentages.N
          ? 'Explore abstract concepts and long-term implications'
          : 'Focus on practical implementation and immediate realities'
      },
      {
        title: 'Decision Making',
        trait1: { letter: 'T', score: weightedResult.percentages.T },
        trait2: { letter: 'F', score: weightedResult.percentages.F },
        strength: Math.abs(weightedResult.percentages.T - weightedResult.percentages.F),
        pattern: weightedResult.percentages.T > weightedResult.percentages.F
          ? 'Makes decisions based on objective analysis and logical consequences'
          : 'Considers impact on people and maintains group harmony',
        growth: weightedResult.percentages.T > weightedResult.percentages.F
          ? 'Develop emotional intelligence and consider personal impact'
          : 'Practice objective analysis and maintain healthy boundaries'
      },
      {
        title: 'Work & Planning',
        trait1: { letter: 'J', score: weightedResult.percentages.J },
        trait2: { letter: 'P', score: weightedResult.percentages.P },
        strength: Math.abs(weightedResult.percentages.J - weightedResult.percentages.P),
        pattern: weightedResult.percentages.J > weightedResult.percentages.P
          ? 'Creates structured plans and follows through systematically'
          : 'Adapts quickly and keeps options open for new opportunities',
        growth: weightedResult.percentages.J > weightedResult.percentages.P
          ? 'Practice flexibility and openness to spontaneous opportunities'
          : 'Develop consistent routines and improve follow-through'
      }
    ];

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
          title: 'Interaction Patterns & Growth Areas',
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

    const allAnswers = results.flatMap(result => result.answers || []);
    if (allAnswers.length === 0) {
      throw new Error('No answers found in test results');
    }

    // Group answers by themes for better narrative flow
    const themes = {
      social: allAnswers.filter(a => 
        a.question?.toLowerCase().includes('social') || 
        a.question?.toLowerCase().includes('group') ||
        a.question?.toLowerCase().includes('people') ||
        a.question?.toLowerCase().includes('communicate')
      ),
      work: allAnswers.filter(a => 
        a.question?.toLowerCase().includes('work') || 
        a.question?.toLowerCase().includes('project') ||
        a.question?.toLowerCase().includes('organize') ||
        a.question?.toLowerCase().includes('plan')
      ),
      learning: allAnswers.filter(a => 
        a.question?.toLowerCase().includes('learn') || 
        a.question?.toLowerCase().includes('problem') ||
        a.question?.toLowerCase().includes('understand') ||
        a.question?.toLowerCase().includes('information')
      ),
      values: allAnswers.filter(a => 
        a.question?.toLowerCase().includes('value') || 
        a.question?.toLowerCase().includes('decision') ||
        a.question?.toLowerCase().includes('important') ||
        a.question?.toLowerCase().includes('feel')
      ),
      energy: allAnswers.filter(a => 
        a.question?.toLowerCase().includes('energy') || 
        a.question?.toLowerCase().includes('recharge') ||
        a.question?.toLowerCase().includes('relax') ||
        a.question?.toLowerCase().includes('prefer')
      )
    };

    // Helper function to clean question text
    const cleanQuestionText = (text) => {
      if (!text) return '';
      return text.toLowerCase()
        .replace(/^(in|when|how|what) (do you|would you|are you|is your|you)/, '')
        .replace(/\?/g, '')
        .replace(/your/g, 'their')
        .replace(/you/g, 'they')
        .trim();
    };

    let story = '';
    const insights = [];

    // Build narrative sections based on available data
    if (themes.social.length > 0) {
      const socialStyle = themes.social.filter(a => a.answer === 'E').length > themes.social.length / 2 
        ? 'naturally outgoing and socially engaged' 
        : 'thoughtful and selective in social interactions';
      const behaviors = themes.social.slice(0, 2)
        .map(a => cleanQuestionText(a.question))
        .filter(text => text.length > 0);
      
      if (behaviors.length > 0) {
        insights.push(`In social settings, this individual is ${socialStyle}. They ${behaviors.join(' and ')}.`);
      }
    }

    if (themes.work.length > 0) {
      const workStyle = themes.work.filter(a => a.answer === 'J').length > themes.work.length / 2
        ? 'structured and methodical'
        : 'flexible and adaptable';
      const behaviors = themes.work.slice(0, 2)
        .map(a => cleanQuestionText(a.question))
        .filter(text => text.length > 0);
      
      if (behaviors.length > 0) {
        insights.push(`Their approach to work is ${workStyle}. They ${behaviors.join(' and ')}.`);
      }
    }

    if (themes.learning.length > 0) {
      const learningStyle = themes.learning.filter(a => a.answer === 'N').length > themes.learning.length / 2
        ? 'focus on patterns and possibilities'
        : 'prefer concrete facts and practical applications';
      const behaviors = themes.learning.slice(0, 2)
        .map(a => cleanQuestionText(a.question))
        .filter(text => text.length > 0);
      
      if (behaviors.length > 0) {
        insights.push(`When learning or problem-solving, they ${learningStyle}. This is evident in how they ${behaviors.join(' and ')}.`);
      }
    }

    if (themes.values.length > 0) {
      const decisionStyle = themes.values.filter(a => a.answer === 'F').length > themes.values.length / 2
        ? 'prioritize personal values and emotional impact'
        : 'focus on logical analysis and objective criteria';
      const behaviors = themes.values.slice(0, 2)
        .map(a => cleanQuestionText(a.question))
        .filter(text => text.length > 0);
      
      if (behaviors.length > 0) {
        insights.push(`In decision-making, they ${decisionStyle}. This is reflected in how they ${behaviors.join(' and ')}.`);
      }
    }

    if (themes.energy.length > 0) {
      const energyStyle = themes.energy.filter(a => a.answer === 'E').length > themes.energy.length / 2
        ? 'gain energy through social interaction and external engagement'
        : 'recharge through solitude and internal reflection';
      const behaviors = themes.energy.slice(0, 2)
        .map(a => cleanQuestionText(a.question))
        .filter(text => text.length > 0);
      
      if (behaviors.length > 0) {
        insights.push(`They typically ${energyStyle}. This is demonstrated by how they ${behaviors.join(' and ')}.`);
      }
    }

    // Combine insights into a cohesive narrative
    story = insights.join('\n\n');

    // Add unique characteristics if available
    const uniqueAnswers = allAnswers.filter(a => 
      !Object.values(themes).flat().includes(a) && 
      a.question && 
      !a.question.includes('?')
    );

    if (uniqueAnswers.length > 0) {
      const uniqueTraits = uniqueAnswers.slice(0, 3)
        .map(a => cleanQuestionText(a.question))
        .filter(text => text.length > 0);
      
      if (uniqueTraits.length > 0) {
        story += `\n\nDistinctive characteristics include how they ${uniqueTraits.join(', ')}.`;
      }
    }

    // Add summary based on test history if multiple tests exist
    if (results.length > 1) {
      story += `\n\nThis analysis is based on ${results.length} personality assessments taken over time, providing a comprehensive view of their personality traits and tendencies.`;
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