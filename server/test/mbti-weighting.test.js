const axios = require('axios');
const assert = require('assert');

async function waitForServer(baseURL, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${baseURL}/api/test`);
      console.log('Server is ready');
      return true;
    } catch (error) {
      console.log(`Waiting for server (attempt ${i + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Server failed to start');
}

async function verifyTestWeights(profile, expectedType, expectedWeights) {
  const { testBreakdown } = profile.data.personalityProfile;
  
  // Verify test weights
  expectedWeights.forEach(({ category, baseWeight }) => {
    const test = testBreakdown.find(t => t.category === category);
    assert(test, `Test result for ${category} not found`);
    assert(test.baseWeight === baseWeight, 
      `Incorrect base weight for ${category}. Expected ${baseWeight}%, got ${test.baseWeight}%`);
  });

  // Verify MBTI type
  assert(profile.data.personalityProfile.type === expectedType,
    `Incorrect MBTI type. Expected ${expectedType}, got ${profile.data.personalityProfile.type}`);
}

async function testMBTIWeighting() {
  const baseURL = process.env.API_URL || 'http://localhost:3002';
  let token;
  
  try {
    await waitForServer(baseURL);

    // Step 1: Login
    console.log('\nLogging in...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    token = loginResponse.data.token;
    
    // Step 2: Take MBTI-100 test
    console.log('\nTaking MBTI-100 test...');
    const mbti100Result = {
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
    };
    
    await axios.post(
      `${baseURL}/api/test-results`,
      mbti100Result,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Verify MBTI-100 results
    const profile100 = await axios.get(
      `${baseURL}/api/users/profile`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    await verifyTestWeights(profile100, 'INTJ', [
      { category: 'mbti-100', baseWeight: 100 }
    ]);
    
    // Step 3: Take MBTI-24 test
    console.log('\nTaking MBTI-24 test...');
    const mbti24Result = {
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
    };
    
    await axios.post(
      `${baseURL}/api/test-results`,
      mbti24Result,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Verify combined weights
    const profile24 = await axios.get(
      `${baseURL}/api/users/profile`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    await verifyTestWeights(profile24, 'INTJ', [
      { category: 'mbti-100', baseWeight: 100 },
      { category: 'mbti-24', baseWeight: 24 }
    ]);
    
    // Step 4: Take MBTI-8 test
    console.log('\nTaking MBTI-8 test...');
    const mbti8Result = {
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
    };
    
    await axios.post(
      `${baseURL}/api/test-results`,
      mbti8Result,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Verify all weights
    const profileAll = await axios.get(
      `${baseURL}/api/users/profile`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    await verifyTestWeights(profileAll, 'INTJ', [
      { category: 'mbti-100', baseWeight: 100 },
      { category: 'mbti-24', baseWeight: 24 },
      { category: 'mbti-8', baseWeight: 8 }
    ]);
    
    // Step 5: Retake MBTI-24
    console.log('\nRetaking MBTI-24 test...');
    const mbti24Retake = {
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
    };
    
    await axios.post(
      `${baseURL}/api/test-results`,
      mbti24Retake,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Verify profile after retake
    const profileRetake = await axios.get(
      `${baseURL}/api/users/profile`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Verify final weights and type
    await verifyTestWeights(profileRetake, 'INTJ', [
      { category: 'mbti-100', baseWeight: 100 },
      { category: 'mbti-24', baseWeight: 24 },
      { category: 'mbti-8', baseWeight: 8 }
    ]);
    
    // Verify trait percentages are not all 50%
    const { percentages } = profileRetake.data.personalityProfile;
    const hasNon50Percent = Object.values(percentages).some(value => value !== 50);
    assert(hasNon50Percent, 'All trait percentages are 50%, which indicates incorrect calculation');
    
    // Verify profile title format
    const { profileTitle } = profileRetake.data.personalityProfile;
    assert(profileTitle.startsWith('INTJ - '), 'Profile title does not start with MBTI type');
    assert(profileTitle.includes('Architect'), 'Profile title does not include type description');
    
    console.log('\n✅ All MBTI weighting tests passed successfully!');
    
  } catch (error) {
    console.error('Test failed:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run tests
console.log('Starting MBTI weighting system tests...');
testMBTIWeighting(); 