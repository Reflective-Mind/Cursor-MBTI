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
  'mbti-100': 1.0,    // 100% weight
  'mbti-24': 0.24,    // 24% weight
  'mbti-8': 0.08      // 8% weight
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

  // Normalize scores
  Object.keys(weightedScores).forEach(trait => {
    if (trait !== 'totalWeight') {
      weightedScores[trait] = Math.round(weightedScores[trait] / weightedScores.totalWeight);
    }
  });

  // Determine final type
  const finalType = [
    weightedScores.E > weightedScores.I ? 'E' : 'I',
    weightedScores.S > weightedScores.N ? 'S' : 'N',
    weightedScores.T > weightedScores.F ? 'T' : 'F',
    weightedScores.J > weightedScores.P ? 'J' : 'P'
  ].join('');

  return {
    type: finalType,
    percentages: weightedScores,
    dominantTraits: {
      attitude: weightedScores.E > weightedScores.I ? 'Extroversion' : 'Introversion',
      perception: weightedScores.S > weightedScores.N ? 'Sensing' : 'Intuition',
      judgment: weightedScores.T > weightedScores.F ? 'Thinking' : 'Feeling',
      lifestyle: weightedScores.J > weightedScores.P ? 'Judging' : 'Perceiving'
    },
    testBreakdown: results.map(r => ({
      category: r.testCategory,
      weight: this.TEST_WEIGHTS[r.testCategory],
      type: r.result.type,
      date: r.createdAt
    }))
  };
};

// Update the updatedAt timestamp before saving
testResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TestResult', testResultSchema); 