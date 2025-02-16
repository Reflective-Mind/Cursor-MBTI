require('dotenv').config({ path: __dirname + '/.env.test' });
const mongoose = require('mongoose');
const assert = require('assert');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

async function verifyMBTIImplementation() {
  try {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to database');

    // Create test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    console.log('Created test user');

    // Test 1: Take MBTI-100
    console.log('\nTest 1: Taking MBTI-100...');
    const mbti100 = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-100',
      result: {
        type: 'INTJ',
        percentages: {
          E: 20, I: 80,
          S: 30, N: 70,
          T: 75, F: 25,
          J: 65, P: 35
        }
      }
    });

    // Verify MBTI-100 results
    let weightedResult = await TestResult.calculateWeightedType(user._id);
    assert.strictEqual(weightedResult.type, 'INTJ', 'MBTI-100 type incorrect');
    assert.strictEqual(weightedResult.testBreakdown[0].baseWeight, 100, 'MBTI-100 weight incorrect');

    // Test 2: Take MBTI-24
    console.log('\nTest 2: Taking MBTI-24...');
    const mbti24 = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-24',
      result: {
        type: 'ENFP',
        percentages: {
          E: 60, I: 40,
          S: 45, N: 55,
          T: 35, F: 65,
          J: 30, P: 70
        }
      }
    });

    // Verify combined weights
    weightedResult = await TestResult.calculateWeightedType(user._id);
    const mbti24Test = weightedResult.testBreakdown.find(t => t.category === 'mbti-24');
    assert.strictEqual(mbti24Test.baseWeight, 24, 'MBTI-24 weight incorrect');

    // Test 3: Take MBTI-8
    console.log('\nTest 3: Taking MBTI-8...');
    const mbti8 = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-8',
      result: {
        type: 'ESFJ',
        percentages: {
          E: 90, I: 10,
          S: 85, N: 15,
          T: 20, F: 80,
          J: 75, P: 25
        }
      }
    });

    // Verify all weights
    weightedResult = await TestResult.calculateWeightedType(user._id);
    const mbti8Test = weightedResult.testBreakdown.find(t => t.category === 'mbti-8');
    assert.strictEqual(mbti8Test.baseWeight, 8, 'MBTI-8 weight incorrect');

    // Test 4: Retake MBTI-24
    console.log('\nTest 4: Retaking MBTI-24...');
    const mbti24Retake = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-24',
      result: {
        type: 'INTP',
        percentages: {
          E: 35, I: 65,
          S: 40, N: 60,
          T: 70, F: 30,
          J: 45, P: 55
        }
      }
    });

    // Verify profile after retake
    weightedResult = await TestResult.calculateWeightedType(user._id);
    
    // Verify weights are correct
    const finalWeights = weightedResult.testBreakdown.reduce((acc, test) => {
      acc[test.category] = test.baseWeight;
      return acc;
    }, {});

    assert.deepStrictEqual(finalWeights, {
      'mbti-100': 100,
      'mbti-24': 24,
      'mbti-8': 8
    }, 'Final weights incorrect');

    // Verify trait percentages are not all 50%
    const hasNon50 = Object.values(weightedResult.percentages).some(v => v !== 50);
    assert(hasNon50, 'All trait percentages are 50%');

    // Verify profile formatting
    const profile = await user.getProfileSections(weightedResult);
    assert(profile.personality.title.startsWith('INTJ'), 'Profile title incorrect');
    assert(profile.personality.content.length === 3, 'Wrong number of profile sections');

    // Verify trait strengths format
    const traitStrengths = profile.personality.content.find(c => c.id === 'trait-strengths');
    assert(traitStrengths.description.pairs.length === 4, 'Wrong number of trait pairs');
    assert('strength' in traitStrengths.description.pairs[0], 'Missing strength in trait pairs');

    // Verify test breakdown format
    const breakdown = profile.personality.content.find(c => c.id === 'test-breakdown');
    assert(breakdown.description.tests.length === 3, 'Wrong number of tests in breakdown');
    assert('effectiveWeight' in breakdown.description.tests[0], 'Missing effective weight in test breakdown');

    console.log('\n✅ All verification tests passed successfully!');

    // Cleanup
    await User.deleteOne({ _id: user._id });
    await TestResult.deleteMany({ user: user._id });
    await mongoose.connection.close();

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyMBTIImplementation(); 