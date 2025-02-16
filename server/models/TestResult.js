const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testCategory: {
    type: String,
    required: true,
    enum: ['mbti-8', 'mbti-24', 'mbti-100']  // Expandable for future test types
  },
  result: {
    type: {
      type: String,
      required: true
    },
    percentages: {
      E: Number,
      I: Number,
      S: Number,
      N: Number,
      T: Number,
      F: Number,
      J: Number,
      P: Number
    },
    dominantTraits: {
      attitude: String,
      perception: String,
      judgment: String,
      lifestyle: String
    },
    traitStrengths: {
      EI: Number,
      SN: Number,
      TF: Number,
      JP: Number
    }
  },
  answers: [{
    questionId: String,
    question: String,
    answer: String,
    category: String
  }],
  analysisVersion: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Exact weight factors for different test types
testResultSchema.statics.TEST_WEIGHTS = {
  'mbti-100': 0.76,    // 76% weight (100 questions)
  'mbti-24': 0.18,     // 18% weight (24 questions)
  'mbti-8': 0.06       // 6% weight (8 questions)
};

// Calculate weighted personality type from multiple test results
testResultSchema.statics.calculateWeightedType = async function(userId) {
  // Get all test results for the user, sorted by most recent first
  const results = await this.find({ user: userId }).sort({ createdAt: -1 });
  
  if (!results || results.length === 0) {
    return null;
  }

  // Keep only the latest result for each test category
  const latestByCategory = {};
  results.forEach(result => {
    if (!latestByCategory[result.testCategory] || 
        result.createdAt > latestByCategory[result.testCategory].createdAt) {
      latestByCategory[result.testCategory] = result;
    }
  });

  // Initialize weighted scores with exact precision
  const weightedScores = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
    totalWeight: 0
  };

  // Calculate weighted scores using precise test weights
  Object.values(latestByCategory).forEach(result => {
    const weight = this.TEST_WEIGHTS[result.testCategory];
    weightedScores.totalWeight += weight;

    // Apply exact weight to each trait score
    Object.entries(result.result.percentages).forEach(([trait, value]) => {
      weightedScores[trait] += value * weight;
    });
  });

  // Normalize the total weight to 1.0
  const normalizedWeight = 1.0 / weightedScores.totalWeight;

  // Calculate final normalized scores for each trait
  const normalizedScores = {};
  const traitPairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
  
  traitPairs.forEach(([trait1, trait2]) => {
    const score1 = weightedScores[trait1] * normalizedWeight;
    const score2 = weightedScores[trait2] * normalizedWeight;
    const total = score1 + score2;
    
    if (total > 0) {
      // Calculate exact percentages
      normalizedScores[trait1] = Math.round((score1 / total) * 100);
      normalizedScores[trait2] = Math.round((score2 / total) * 100);
    } else {
      // Default to 50-50 only if no data exists
      normalizedScores[trait1] = 50;
      normalizedScores[trait2] = 50;
    }
  });

  // Calculate precise trait strengths
  const traitStrengths = {
    EI: Math.abs(normalizedScores.E - normalizedScores.I),
    SN: Math.abs(normalizedScores.S - normalizedScores.N),
    TF: Math.abs(normalizedScores.T - normalizedScores.F),
    JP: Math.abs(normalizedScores.J - normalizedScores.P)
  };

  // Use 15% threshold for balanced trait determination
  const BALANCED_THRESHOLD = 15;

  // Determine final type based on normalized scores
  const finalType = [
    normalizedScores.E > normalizedScores.I ? 'E' : 'I',
    normalizedScores.S > normalizedScores.N ? 'S' : 'N',
    normalizedScores.T > normalizedScores.F ? 'T' : 'F',
    normalizedScores.J > normalizedScores.P ? 'J' : 'P'
  ].join('');

  // Calculate exact test contributions
  const testContributions = Object.values(latestByCategory).map(r => ({
    category: r.testCategory,
    type: r.result.type,
    baseWeight: this.TEST_WEIGHTS[r.testCategory] * 100, // Show as percentage
    effectiveWeight: Math.round((this.TEST_WEIGHTS[r.testCategory] / weightedScores.totalWeight) * 100),
    date: r.createdAt,
    percentages: r.result.percentages
  })).sort((a, b) => b.effectiveWeight - a.effectiveWeight);

  // Get detailed personality title
  const personalityTitles = {
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

  return {
    type: finalType,
    percentages: normalizedScores,
    dominantTraits: {
      attitude: normalizedScores.E > normalizedScores.I ? 'Extroversion' : 'Introversion',
      perception: normalizedScores.S > normalizedScores.N ? 'Sensing' : 'Intuition',
      judgment: normalizedScores.T > normalizedScores.F ? 'Thinking' : 'Feeling',
      lifestyle: normalizedScores.J > normalizedScores.P ? 'Judging' : 'Perceiving'
    },
    traitStrengths,
    testBreakdown: testContributions,
    isBalanced: Object.values(traitStrengths).some(strength => strength <= BALANCED_THRESHOLD),
    profileTitle: `${finalType} - ${personalityTitles[finalType] || 'Personality Type'}`
  };
};

// Update timestamp before saving
testResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TestResult', testResultSchema); 