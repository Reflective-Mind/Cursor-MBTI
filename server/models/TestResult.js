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

  // Initialize weighted scores
  const weightedScores = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
    totalWeight: 0
  };

  // Calculate weighted scores
  results.forEach(result => {
    const weight = this.TEST_WEIGHTS[result.testCategory];
    weightedScores.totalWeight += weight;

    Object.entries(result.result.percentages).forEach(([trait, value]) => {
      weightedScores[trait] += value * weight;
    });
  });

  // Normalize scores and ensure they sum to 100% for each dichotomy
  const normalizedScores = {
    E: Math.round(weightedScores.E / weightedScores.totalWeight),
    I: Math.round(weightedScores.I / weightedScores.totalWeight),
    S: Math.round(weightedScores.S / weightedScores.totalWeight),
    N: Math.round(weightedScores.N / weightedScores.totalWeight),
    T: Math.round(weightedScores.T / weightedScores.totalWeight),
    F: Math.round(weightedScores.F / weightedScores.totalWeight),
    J: Math.round(weightedScores.J / weightedScores.totalWeight),
    P: Math.round(weightedScores.P / weightedScores.totalWeight)
  };

  // Determine final type based on normalized scores
  const finalType = [
    normalizedScores.E > normalizedScores.I ? 'E' : 'I',
    normalizedScores.S > normalizedScores.N ? 'S' : 'N',
    normalizedScores.T > normalizedScores.F ? 'T' : 'F',
    normalizedScores.J > normalizedScores.P ? 'J' : 'P'
  ].join('');

  // Calculate trait strengths (difference between opposing traits)
  const traitStrengths = {
    EI: Math.abs(normalizedScores.E - normalizedScores.I),
    SN: Math.abs(normalizedScores.S - normalizedScores.N),
    TF: Math.abs(normalizedScores.T - normalizedScores.F),
    JP: Math.abs(normalizedScores.J - normalizedScores.P)
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
    testBreakdown: results.map(r => ({
      category: r.testCategory,
      weight: Math.round(this.TEST_WEIGHTS[r.testCategory] * 100 / weightedScores.totalWeight),
      type: r.result.type,
      date: r.createdAt,
      percentages: r.result.percentages
    }))
  };
};

// Update the updatedAt timestamp before saving
testResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TestResult', testResultSchema); 