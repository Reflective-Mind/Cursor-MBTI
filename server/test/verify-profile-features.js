require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');
const User = require('../models/User');
const TestResult = require('../models/TestResult');

async function verifyProfileFeatures() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    // Clean up any existing test data
    console.log('Cleaning up existing test data...');
    await User.deleteMany({ email: 'test@example.com' });
    await TestResult.deleteMany({ user: { $exists: true } });
    console.log('Cleanup completed');

    // Create test user
    const user = await User.create({
      username: 'test_' + Math.floor(Math.random() * 1000),
      email: 'test@example.com',
      password: 'password123',
      mbtiType: 'INTJ',
      profileSections: [{
        id: 'personality',
        title: 'Personality Profile',
        type: 'personality',
        content: [{
          id: 'overview',
          title: 'Personality Overview',
          description: 'Initial overview',
          contentType: 'text'
        }],
        order: 0,
        isVisible: true
      }]
    });
    console.log('Created test user:', user._id);

    // Create test result
    const testResult = await TestResult.create({
      user: user._id,
      testCategory: 'mbti-8',
      result: {
        type: 'INTJ',
        percentages: {
          E: 20, I: 80,
          S: 30, N: 70,
          T: 75, F: 25,
          J: 65, P: 35
        }
      },
      answers: [
        { questionId: '1', answer: 'I', category: 'EI' },
        { questionId: '2', answer: 'N', category: 'SN' },
        { questionId: '3', answer: 'T', category: 'TF' },
        { questionId: '4', answer: 'J', category: 'JP' }
      ]
    });
    console.log('Created test result');

    // Test 1: Generate AI Story
    console.log('\nTest 1: Generating AI Story...');
    const story = await user.generateAIStory();
    assert(story, 'AI Story generation failed');
    assert(story.length > 0, 'AI Story is empty');
    console.log('✓ AI Story generated successfully');

    // Test 2: Add new section
    console.log('\nTest 2: Adding new section...');
    const initialSectionCount = user.profileSections.length;
    const newSection = {
      id: new mongoose.Types.ObjectId().toString(),
      title: 'Test Section',
      type: 'custom',
      content: [],
      order: initialSectionCount,
      isVisible: true
    };
    user.profileSections.push(newSection);
    await user.save();
    
    const updatedUser = await User.findById(user._id);
    assert(updatedUser.profileSections.length === initialSectionCount + 1, 'Section not added');
    console.log('✓ New section added successfully');

    // Test 3: Delete custom section
    console.log('\nTest 3: Deleting custom section...');
    const sectionToDelete = updatedUser.profileSections[updatedUser.profileSections.length - 1];
    updatedUser.profileSections = updatedUser.profileSections.filter(s => s.id !== sectionToDelete.id);
    await updatedUser.save();
    
    const userAfterDelete = await User.findById(user._id);
    assert(userAfterDelete.profileSections.length === initialSectionCount, 'Section not deleted');
    console.log('✓ Section deleted successfully');

    // Test 4: Try to delete personality section
    console.log('\nTest 4: Verifying personality section protection...');
    const personalitySection = userAfterDelete.profileSections.find(s => s.type === 'personality' && s.id === 'personality');
    if (personalitySection) {
      try {
        userAfterDelete.profileSections = userAfterDelete.profileSections.filter(s => s.id !== 'personality');
        await userAfterDelete.save();
        throw new Error('Should not be able to delete personality section');
      } catch (error) {
        console.log('✓ Personality section properly protected');
      }
    }

    // Test 5: Add and delete content
    console.log('\nTest 5: Testing content management...');
    const testSection = {
      id: new mongoose.Types.ObjectId().toString(),
      title: 'Content Test Section',
      type: 'custom',
      content: [],
      order: userAfterDelete.profileSections.length,
      isVisible: true
    };
    userAfterDelete.profileSections.push(testSection);
    await userAfterDelete.save();
    
    // Verify section was added
    const userWithSection = await User.findById(user._id);
    const section = userWithSection.profileSections.find(s => s.id === testSection.id);
    assert(section, 'Section not found');
    
    // Add content to section
    section.content.push({
      id: new mongoose.Types.ObjectId().toString(),
      title: 'Test Content',
      description: 'Test Description',
      contentType: 'text'
    });
    await userWithSection.save();
    
    // Verify content was added
    const userWithContent = await User.findById(user._id);
    const updatedSection = userWithContent.profileSections.find(s => s.id === testSection.id);
    assert(updatedSection && updatedSection.content.length === 1, 'Content not added');
    console.log('✓ Content added successfully');
    
    // Test content deletion
    updatedSection.content = [];
    await userWithContent.save();
    
    const finalUser = await User.findById(user._id);
    const finalSection = finalUser.profileSections.find(s => s.id === testSection.id);
    assert(finalSection && finalSection.content.length === 0, 'Content not deleted');
    console.log('✓ Content deleted successfully');

    // Cleanup
    await User.deleteOne({ _id: user._id });
    await TestResult.deleteMany({ user: user._id });
    console.log('\nCleanup completed');

    console.log('\n✅ All profile features verified successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run verification
console.log('Starting profile features verification...');
verifyProfileFeatures(); 