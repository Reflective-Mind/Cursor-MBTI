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

// Update the updatedAt timestamp before saving
testResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TestResult', testResultSchema); 