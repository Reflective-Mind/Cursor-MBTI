const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store test results
router.post('/users/me/test-results', auth, async (req, res) => {
  try {
    // Map test type to category
    const testTypeMapping = {
      'mbti-8': 'mbti-8',
      'mbti-24': 'mbti-24',
      'mbti-100': 'mbti-100'
    };

    const testCategory = testTypeMapping[req.body.testType];
    if (!testCategory) {
      return res.status(400).json({ message: 'Invalid test type' });
    }

    // Check if a result for this test category already exists
    const existingResult = await TestResult.findOne({
      user: req.user._id,
      testCategory
    });

    if (existingResult) {
      // Update existing result
      existingResult.result = req.body.result;
      existingResult.answers = req.body.answers.map(answer => ({
        ...answer,
        question: req.body.questions.find(q => q.id === answer.questionId)?.text,
        category: req.body.questions.find(q => q.id === answer.questionId)?.category
      }));
      existingResult.analysisVersion += 1;
      await existingResult.save();
      
      // Update user's MBTI type if this is the most comprehensive test
      if (testCategory === 'mbti-100' || 
         (testCategory === 'mbti-24' && !await TestResult.findOne({ user: req.user._id, testCategory: 'mbti-100' })) ||
         (testCategory === 'mbti-8' && !await TestResult.findOne({ user: req.user._id, testCategory: { $in: ['mbti-24', 'mbti-100'] } }))) {
        await User.findByIdAndUpdate(req.user._id, {
          mbtiType: req.body.result.type
        });
      }
      
      return res.status(200).json(existingResult);
    } else {
      // Create new result
      const testResult = new TestResult({
        user: req.user._id,
        testCategory,
        result: req.body.result,
        answers: req.body.answers.map(answer => ({
          ...answer,
          question: req.body.questions.find(q => q.id === answer.questionId)?.text,
          category: req.body.questions.find(q => q.id === answer.questionId)?.category
        }))
      });

      await testResult.save();

      // Update user's MBTI type following the same logic
      if (testCategory === 'mbti-100' || 
         (testCategory === 'mbti-24' && !await TestResult.findOne({ user: req.user._id, testCategory: 'mbti-100' })) ||
         (testCategory === 'mbti-8' && !await TestResult.findOne({ user: req.user._id, testCategory: { $in: ['mbti-24', 'mbti-100'] } }))) {
        await User.findByIdAndUpdate(req.user._id, {
          mbtiType: req.body.result.type
        });
      }

      return res.status(201).json(testResult);
    }
  } catch (error) {
    console.error('Error storing test results:', error);
    res.status(500).json({ message: 'Error storing test results' });
  }
});

// Generate AI story
router.post('/users/:userId/generate-story', auth, async (req, res) => {
  try {
    // Verify user has permission
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to generate story for this user' });
    }

    // Get all test results for the user
    const testResults = await TestResult.find({ user: req.user._id })
      .sort('-createdAt');

    if (!testResults.length) {
      return res.status(400).json({ message: 'No test results found' });
    }

    // Get the most comprehensive MBTI result
    const mbtiResult = testResults.find(r => r.testCategory === 'mbti-100') ||
                      testResults.find(r => r.testCategory === 'mbti-24') ||
                      testResults.find(r => r.testCategory === 'mbti-8');

    // Prepare a comprehensive analysis of all test results
    const testAnalysis = testResults.map(test => ({
      category: test.testCategory,
      version: test.analysisVersion,
      date: test.updatedAt,
      result: test.result,
      answers: test.answers
    }));

    // Create a detailed prompt based on all available data
    const prompt = `Create a comprehensive personality story based on the following test results:

Main MBTI Type: ${mbtiResult.result.type}

Detailed MBTI Analysis:
- Extraversion: ${mbtiResult.result.percentages.E}% vs Introversion: ${mbtiResult.result.percentages.I}%
- Sensing: ${mbtiResult.result.percentages.S}% vs Intuition: ${mbtiResult.result.percentages.N}%
- Thinking: ${mbtiResult.result.percentages.T}% vs Feeling: ${mbtiResult.result.percentages.F}%
- Judging: ${mbtiResult.result.percentages.J}% vs Perceiving: ${mbtiResult.result.percentages.P}%

Test History:
${testAnalysis.map(test => `- ${test.category} (Version ${test.version}, ${new Date(test.date).toLocaleDateString()})`).join('\n')}

Key Traits:
${Object.entries(mbtiResult.result.dominantTraits).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Generate a detailed narrative (${testResults.length > 5 ? '600' : testResults.length > 2 ? '400' : '200'} words) that:
1. Tells a compelling story about this person's personality
2. Highlights their unique combination of traits
3. Discusses their potential strengths and growth areas
4. Describes how they likely interact with others
5. Mentions their decision-making style and communication preferences
6. Provides insights into their ideal environment and work style

Make the story engaging and personal, avoiding direct test references while maintaining accuracy to the results.
Use a warm, insightful tone that helps readers truly understand this person.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a master personality analyst who creates deep, insightful, and engaging character narratives based on psychological assessments. Your stories help people truly understand and connect with the subject's personality."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: testResults.length > 5 ? 900 : testResults.length > 2 ? 600 : 300
    });

    const story = completion.choices[0].message.content;
    res.json({ story });
  } catch (error) {
    console.error('Error generating AI story:', error);
    res.status(500).json({ message: 'Error generating AI story' });
  }
});

module.exports = router; 