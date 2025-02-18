/**
 * Test Result Model
 * ================
 * 
 * Manages MBTI personality test results and analysis.
 * Implements a sophisticated weighted scoring system for multiple test types.
 * 
 * Test Categories:
 * - MBTI-8: Quick assessment (8 questions, 6% weight)
 * - MBTI-24: Standard assessment (24 questions, 18% weight)
 * - MBTI-100: Comprehensive assessment (100 questions, 76% weight)
 * 
 * Key Features:
 * - Stores individual test results
 * - Calculates weighted personality types
 * - Tracks answer history
 * - Provides detailed trait analysis
 * 
 * Weight System:
 * The model uses a weighted scoring system that prioritizes more comprehensive tests
 * while still considering quick assessments for a balanced analysis.
 */

const mongoose = require('mongoose');

/**
 * Test Result Schema
 * -----------------
 * Core schema for storing and analyzing MBTI test results
 */
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
      E: Number,  // Extraversion
      I: Number,  // Introversion
      S: Number,  // Sensing
      N: Number,  // Intuition
      T: Number,  // Thinking
      F: Number,  // Feeling
      J: Number,  // Judging
      P: Number   // Perceiving
    },
    dominantTraits: {
      attitude: String,    // E/I preference
      perception: String,  // S/N preference
      judgment: String,    // T/F preference
      lifestyle: String    // J/P preference
    },
    traitStrengths: {
      EI: Number,  // Extraversion-Introversion strength
      SN: Number,  // Sensing-Intuition strength
      TF: Number,  // Thinking-Feeling strength
      JP: Number   // Judging-Perceiving strength
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

  // Determine if we only have MBTI-8 and MBTI-24
  const hasOnly8And24 = Object.keys(latestByCategory).length === 2 &&
    !latestByCategory['mbti-100'] &&
    latestByCategory['mbti-8'] &&
    latestByCategory['mbti-24'];

  // Calculate weighted scores using precise test weights
  Object.values(latestByCategory).forEach(result => {
    let weight;
    if (hasOnly8And24) {
      weight = result.testCategory === 'mbti-24' ? 0.75 : 0.25;
    } else {
      weight = this.TEST_WEIGHTS[result.testCategory];
    }
    
    weightedScores.totalWeight += weight;

    // Apply weight to each trait score with proper normalization
    Object.entries(result.result.percentages).forEach(([trait, value]) => {
      weightedScores[trait] += (value / 100) * weight;
    });
  });

  // Calculate final normalized scores for each trait
  const normalizedScores = {};
  const traitPairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
  
  traitPairs.forEach(([trait1, trait2]) => {
    const score1 = weightedScores[trait1];
    const score2 = weightedScores[trait2];
    
    // Calculate exact percentages based on weighted proportions
    normalizedScores[trait1] = Math.round((score1 / weightedScores.totalWeight) * 100);
    normalizedScores[trait2] = Math.round((score2 / weightedScores.totalWeight) * 100);
  });

  // Calculate test contributions
  const testContributions = Object.values(latestByCategory).map(r => ({
    category: r.testCategory,
    type: r.result.type,
    effectiveWeight: hasOnly8And24 ? 
      (r.testCategory === 'mbti-24' ? 75 : 25) :
      Math.round((this.TEST_WEIGHTS[r.testCategory] / weightedScores.totalWeight) * 100),
    date: r.createdAt,
    percentages: r.result.percentages
  })).sort((a, b) => b.effectiveWeight - a.effectiveWeight);

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