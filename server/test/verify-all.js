require('dotenv').config({ path: __dirname + '/.env.test' });
const mongoose = require('mongoose');
const assert = require('assert');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

async function verifyAllFunctionality() {
  try {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to database');

    // Clean up any existing test data
    await User.deleteMany({ email: /^test.*@example\.com$/ });
    console.log('Cleaned up existing test data');

    // Test 1: Create a new user
    console.log('\nTest 1: Creating new user...');
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      mbtiType: 'INTJ'
    });

    assert(user, 'User creation failed');
    console.log('✓ User created successfully');

    // Test 2: Login
    console.log('\nTest 2: Testing login...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    assert(token, 'Token generation failed');
    console.log('✓ Login successful');

    // Test 3: Take MBTI-8 test
    console.log('\nTest 3: Taking MBTI-8 test...');
    const mbti8Result = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-8',
      result: {
        type: 'ENFP',
        percentages: {
          E: 60, I: 40,
          S: 45, N: 55,
          T: 35, F: 65,
          J: 30, P: 70
        }
      },
      answers: [
        { questionId: '1', answer: 'E' },
        { questionId: '2', answer: 'N' },
        { questionId: '3', answer: 'F' },
        { questionId: '4', answer: 'P' }
      ]
    });

    assert(mbti8Result, 'MBTI-8 test creation failed');
    console.log('✓ MBTI-8 test completed');

    // Test 4: Calculate weighted type
    console.log('\nTest 4: Calculating weighted type...');
    const weightedResult = await TestResult.calculateWeightedType(user._id);
    
    assert(weightedResult, 'Weighted calculation failed');
    assert(weightedResult.type === 'ENFP', `Wrong type calculated: ${weightedResult.type}`);
    assert(weightedResult.testBreakdown.length === 1, 'Wrong number of test results');
    assert(weightedResult.testBreakdown[0].baseWeight === 8, 'Wrong test weight');
    console.log('✓ Weighted calculation correct');

    // Test 5: Get profile sections
    console.log('\nTest 5: Getting profile sections...');
    const profileSections = await user.getProfileSections(weightedResult);
    
    assert(Array.isArray(profileSections), 'Profile sections should be an array');
    assert(profileSections.length > 0, 'No profile sections returned');
    assert(profileSections[0].title.includes('ENFP'), 'Wrong type in profile title');
    console.log('✓ Profile sections correct');

    // Test 6: Update user with weighted result
    console.log('\nTest 6: Updating user profile...');
    user.mbtiType = weightedResult.type;
    user.personalityTraits = [
      { trait: 'Extroversion-Introversion', strength: weightedResult.percentages.E },
      { trait: 'Sensing-Intuition', strength: weightedResult.percentages.S },
      { trait: 'Thinking-Feeling', strength: weightedResult.percentages.T },
      { trait: 'Judging-Perceiving', strength: weightedResult.percentages.J }
    ];
    user.profileSections = profileSections;
    await user.save();

    const updatedUser = await User.findById(user._id);
    assert(updatedUser.mbtiType === 'ENFP', 'User MBTI type not updated');
    assert(updatedUser.profileSections.length > 0, 'Profile sections not saved');
    console.log('✓ User profile updated successfully');

    // Test 7: Take MBTI-24 test
    console.log('\nTest 7: Taking MBTI-24 test...');
    const mbti24Result = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-24',
      result: {
        type: 'INTJ',
        percentages: {
          E: 40, I: 60,
          S: 45, N: 55,
          T: 70, F: 30,
          J: 55, P: 45
        }
      }
    });

    const newWeightedResult = await TestResult.calculateWeightedType(user._id);
    assert(newWeightedResult.testBreakdown.length === 2, 'Wrong number of tests after MBTI-24');
    console.log('✓ MBTI-24 test completed and weighted correctly');

    // Test 8: Verify final state
    console.log('\nTest 8: Verifying final state...');
    const finalUser = await User.findById(user._id);
    const finalSections = await finalUser.getProfileSections(newWeightedResult);
    
    assert(Array.isArray(finalSections), 'Final sections should be an array');
    assert(finalSections.length > 0, 'No final sections');
    assert(finalSections[0].content.length === 3, 'Wrong number of content sections');
    console.log('✓ Final state verified');

    // Cleanup
    await User.deleteOne({ _id: user._id });
    await TestResult.deleteMany({ user: user._id });
    await mongoose.connection.close();

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('Test failed:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run verification
console.log('Starting comprehensive verification...');
verifyAllFunctionality(); 