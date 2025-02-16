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

// Weight factors for different test types
testResultSchema.statics.TEST_WEIGHTS = {
  'mbti-100': 1.0,    // 100% weight for comprehensive test
  'mbti-24': 0.24,    // 24% weight for standard test
  'mbti-8': 0.08      // 8% weight for quick test
};

// Calculate weighted personality type from multiple test results
testResultSchema.statics.calculateWeightedType = async function(userId) {
  const results = await this.find({ user: userId }).sort({ createdAt: -1 });
  
  if (!results || results.length === 0) {
    return null;
  }

  // Group results by test category (keep only latest of each type)
  const latestByCategory = {};
  results.forEach(result => {
    if (!latestByCategory[result.testCategory] || 
        result.createdAt > latestByCategory[result.testCategory].createdAt) {
      latestByCategory[result.testCategory] = result;
    }
  });

  // Initialize weighted scores
  const weightedScores = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
    totalWeight: 0
  };

  // Calculate weighted scores using only the latest result of each test type
  Object.values(latestByCategory).forEach(result => {
    const weight = this.TEST_WEIGHTS[result.testCategory];
    weightedScores.totalWeight += weight;

    // Apply weight to each trait score with emphasis on test category
    Object.entries(result.result.percentages).forEach(([trait, value]) => {
      weightedScores[trait] += value * weight * (1 + weight); // Increase influence of higher weighted tests
    });
  });

  // Normalize scores for each dichotomy pair with adjusted weighting
  const normalizedScores = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  };

  // Normalize each dichotomy pair separately with weighted influence
  [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']].forEach(([trait1, trait2]) => {
    const score1 = weightedScores[trait1];
    const score2 = weightedScores[trait2];
    const total = score1 + score2;
    
    if (total > 0) {
      // Calculate normalized scores with weighted bias
      const weightedBias = Math.min(0.1, weightedScores.totalWeight * 0.05); // Add slight bias based on total weight
      const rawScore1 = (score1 / total);
      normalizedScores[trait1] = Math.round((rawScore1 + (rawScore1 > 0.5 ? weightedBias : -weightedBias)) * 100);
      normalizedScores[trait2] = 100 - normalizedScores[trait1];
    } else {
      // Default to neutral only if no data available
      normalizedScores[trait1] = 50;
      normalizedScores[trait2] = 50;
    }
  });

  // Calculate trait strengths with emphasis on test weights
  const traitStrengths = {
    EI: Math.abs(normalizedScores.E - normalizedScores.I),
    SN: Math.abs(normalizedScores.S - normalizedScores.N),
    TF: Math.abs(normalizedScores.T - normalizedScores.F),
    JP: Math.abs(normalizedScores.J - normalizedScores.P)
  };

  // Adjust minimum strength threshold based on test weights
  const MINIMUM_STRENGTH_THRESHOLD = Math.max(
    15,  // Base threshold
    weightedScores.totalWeight * 8  // Weighted threshold adjustment
  );

  // Determine final type based on normalized scores
  const finalType = [
    normalizedScores.E > normalizedScores.I ? 'E' : 'I',
    normalizedScores.S > normalizedScores.N ? 'S' : 'N',
    normalizedScores.T > normalizedScores.F ? 'T' : 'F',
    normalizedScores.J > normalizedScores.P ? 'J' : 'P'
  ].join('');

  // Calculate test contributions with adjusted weights
  const testContributions = Object.values(latestByCategory).map(r => ({
    category: r.testCategory,
    weight: Math.round((this.TEST_WEIGHTS[r.testCategory] / weightedScores.totalWeight) * 100),
    type: r.result.type,
    date: r.createdAt,
    percentages: r.result.percentages
  })).sort((a, b) => b.weight - a.weight);

  // Get personality title
  const getPersonalityTitle = (type) => {
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
    return titles[type] || 'Personality Type';
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
    isBalanced: Object.values(traitStrengths).some(strength => strength <= MINIMUM_STRENGTH_THRESHOLD),
    profileTitle: `${finalType} - ${getPersonalityTitle(finalType)}`
  };
};

// Update the updatedAt timestamp before saving
testResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TestResult', testResultSchema); 