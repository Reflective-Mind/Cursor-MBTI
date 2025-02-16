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
      enum: ['default', 'custom', 'ai_analysis'],
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
userSchema.methods.getProfileSections = async function() {
  const TestResult = mongoose.model('TestResult');
  const weightedResult = await TestResult.calculateWeightedType(this._id);

  const defaultSections = {
    personality: {
      id: 'personality',
      title: weightedResult ? 
        `${weightedResult.type} - ${weightedResult.profileTitle.split(' - ')[1]}` :
        `${this.mbtiType || 'Unknown'} - Take the MBTI Test`,
      type: 'default',
      content: [
        {
          id: 'overview',
          title: 'MBTI Personality Overview',
          description: weightedResult ? 
            generatePersonalityOverview(weightedResult) :
            'Take the MBTI test to discover your personality type and receive a detailed analysis of your traits.',
          contentType: 'text'
        },
        ...(weightedResult ? [{
          id: 'test-breakdown',
          title: 'Test Results Analysis',
          description: formatTestBreakdown(weightedResult),
          contentType: 'text'
        }] : []),
        ...(weightedResult ? [{
          id: 'trait-strengths',
          title: 'Trait Strength Analysis',
          description: formatTraitStrengths(weightedResult),
          contentType: 'text'
        }] : []),
        ...(weightedResult ? weightedResult.testBreakdown.map((test, index) => ({
          id: `test-${index}`,
          title: `${test.category.toUpperCase()} Test Results`,
          description: formatTestDetails(test),
          contentType: 'text'
        })) : [])
      ]
    },
    interests: {
      id: 'interests',
      title: 'Interests & Activities',
      type: 'default',
      content: this.interests.map((interest, index) => ({
        id: `interest-${index}`,
        title: interest,
        contentType: 'text'
      }))
    },
    languages: {
      id: 'languages',
      title: 'Language Proficiency',
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
      title: 'Achievements & Milestones',
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

// Helper function to get personality type title
function getPersonalityTitle(mbtiType) {
  const titles = {
    'INTJ': 'Architect - Strategic & Analytical Mastermind',
    'INTP': 'Logician - Innovative Problem Solver',
    'ENTJ': 'Commander - Dynamic & Strategic Leader',
    'ENTP': 'Debater - Innovative & Versatile Thinker',
    'INFJ': 'Counselor - Insightful & Empathetic Guide',
    'INFP': 'Mediator - Creative & Authentic Idealist',
    'ENFJ': 'Teacher - Charismatic & Inspiring Leader',
    'ENFP': 'Champion - Enthusiastic & Creative Catalyst',
    'ISTJ': 'Inspector - Reliable & Systematic Organizer',
    'ISFJ': 'Protector - Dedicated & Nurturing Guardian',
    'ESTJ': 'Supervisor - Efficient & Practical Manager',
    'ESFJ': 'Provider - Supportive & Social Harmonizer',
    'ISTP': 'Craftsperson - Skilled & Adaptable Problem-Solver',
    'ISFP': 'Composer - Artistic & Compassionate Creator',
    'ESTP': 'Dynamo - Energetic & Practical Doer',
    'ESFP': 'Performer - Spontaneous & Engaging Entertainer'
  };
  return titles[mbtiType] || 'Personality Type';
}

// Helper function to generate personality overview
function generatePersonalityOverview(weightedResult) {
  if (weightedResult.isBalanced) {
    const traits = [
      { name: 'Extroversion-Introversion', trait: weightedResult.dominantTraits.attitude, strength: weightedResult.traitStrengths.EI },
      { name: 'Sensing-Intuition', trait: weightedResult.dominantTraits.perception, strength: weightedResult.traitStrengths.SN },
      { name: 'Thinking-Feeling', trait: weightedResult.dominantTraits.judgment, strength: weightedResult.traitStrengths.TF },
      { name: 'Judging-Perceiving', trait: weightedResult.dominantTraits.lifestyle, strength: weightedResult.traitStrengths.JP }
    ];

    const balancedTraits = traits
      .filter(t => t.strength <= 15)
      .map(t => t.name);

    if (balancedTraits.length > 0) {
      return `Your test results show balanced preferences in ${balancedTraits.join(', ')}. To get a more definitive type assessment, consider taking the comprehensive MBTI-100 test which provides the most accurate results.`;
    }
  }

  const traits = [
    { name: 'Extroversion-Introversion', trait: weightedResult.dominantTraits.attitude, strength: weightedResult.traitStrengths.EI, score: weightedResult.percentages[weightedResult.type[0]] },
    { name: 'Sensing-Intuition', trait: weightedResult.dominantTraits.perception, strength: weightedResult.traitStrengths.SN, score: weightedResult.percentages[weightedResult.type[1]] },
    { name: 'Thinking-Feeling', trait: weightedResult.dominantTraits.judgment, strength: weightedResult.traitStrengths.TF, score: weightedResult.percentages[weightedResult.type[2]] },
    { name: 'Judging-Perceiving', trait: weightedResult.dominantTraits.lifestyle, strength: weightedResult.traitStrengths.JP, score: weightedResult.percentages[weightedResult.type[3]] }
  ];

  const strongestTraits = traits
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2);

  return `Based on your weighted test results, you show a ${weightedResult.type} personality type. Your strongest traits are ${strongestTraits[0].trait} (${strongestTraits[0].score}% preference) and ${strongestTraits[1].trait} (${strongestTraits[1].score}% preference). This combination creates a unique perspective that influences how you interact with the world, make decisions, and process information.`;
}

// Helper function to format trait strengths
function formatTraitStrengths(weightedResult) {
  const traits = [
    { name: 'Extroversion-Introversion', e: 'E', i: 'I', eScore: weightedResult.percentages.E, iScore: weightedResult.percentages.I, strength: weightedResult.traitStrengths.EI },
    { name: 'Sensing-Intuition', e: 'S', i: 'N', eScore: weightedResult.percentages.S, iScore: weightedResult.percentages.N, strength: weightedResult.traitStrengths.SN },
    { name: 'Thinking-Feeling', e: 'T', i: 'F', eScore: weightedResult.percentages.T, iScore: weightedResult.percentages.F, strength: weightedResult.traitStrengths.TF },
    { name: 'Judging-Perceiving', e: 'J', i: 'P', eScore: weightedResult.percentages.J, iScore: weightedResult.percentages.P, strength: weightedResult.traitStrengths.JP }
  ];

  return traits.map(trait => `
${trait.name}:
${trait.e}: ${trait.eScore}% | ${trait.i}: ${trait.iScore}%
Preference Strength: ${trait.strength}%
${trait.strength <= 15 ? '(Consider taking MBTI-100 for clearer preference)' : `(Clear ${trait.eScore > trait.iScore ? trait.e : trait.i} preference)`}
  `).join('\n\n');
}

// Helper function to format test details
function formatTestDetails(test) {
  const date = new Date(test.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const percentages = Object.entries(test.percentages)
    .map(([trait, value]) => `${trait}: ${value}%`)
    .join('\n');

  return `
Test Type: ${test.category.toUpperCase()}
Result: ${test.type}
Weight: ${test.weight}% contribution to final type
Date Taken: ${date}

Trait Percentages:
${percentages}
  `.trim();
}

// Helper function to format test breakdown
function formatTestBreakdown(weightedResult) {
  const testContributions = weightedResult.testBreakdown
    .map(test => `
${test.category.toUpperCase()}:
• Type: ${test.type}
• Weight: ${test.weight}% contribution
• Date: ${new Date(test.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`)
    .join('\n\n');

  return `
Your personality type is calculated using a weighted average of your test results, with longer tests having more influence on the final type determination.

Test Contribution Breakdown:
${testContributions}

${weightedResult.isBalanced ? 
  '\nNote: Some of your preferences show balanced scores. Consider taking the MBTI-100 test for a more definitive assessment.' : 
  '\nYour preferences show clear distinctions across all dimensions.'}
  `.trim();
}

const User = mongoose.model('User', userSchema);

module.exports = User; 