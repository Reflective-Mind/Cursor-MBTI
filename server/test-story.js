const axios = require('axios');

async function testServer() {
  const baseURL = 'http://localhost:3002';
  let userId, token;
  
  try {
    console.log(`Testing server connection to ${baseURL}...`);
    console.log('Making GET request to /api/test endpoint...');
    
    const response = await axios.get(`${baseURL}/api/test`, {
      timeout: 5000 // 5 second timeout
    }).catch(error => {
      console.error('Server test failed with error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        errno: error.errno,
        stack: error.stack
      });
      throw error;
    });

    console.log('Server is accessible:', {
      status: response.status,
      data: response.data
    });

    // Try to register first
    console.log('\nTrying to register a test user...');
    const registerData = {
      email: 'guruzen@example.com',
      password: 'password123',
      username: 'guruzen',
      mbtiType: 'INTJ'
    };
    
    try {
      const registerResponse = await axios.post(`${baseURL}/api/auth/register`, registerData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log('Registration successful:', {
        status: registerResponse.status,
        data: registerResponse.data
      });
      userId = registerResponse.data.user.id;
      token = registerResponse.data.token;
    } catch (regError) {
      console.log('Registration failed (this is expected if user exists):', {
        status: regError.response?.status,
        data: regError.response?.data
      });
    }

    // Now try login if we don't have a token
    if (!token) {
      console.log('\nTesting login...');
      console.log('Making POST request to /api/auth/login endpoint...');
      
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'guruzen@example.com',
        password: 'password123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }).catch(error => {
        console.error('Login request failed with error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
          errno: error.errno,
          stack: error.stack
        });
        throw error;
      });

      console.log('Login successful:', {
        status: loginResponse.status,
        hasToken: !!loginResponse.data?.token,
        hasUser: !!loginResponse.data?.user
      });

      userId = loginResponse.data.user.id;
      token = loginResponse.data.token;
    }

    // Create test result
    console.log('\nCreating test result...');
    const testResult = {
      testType: 'mbti-24',
      result: {
        type: 'INTJ',
        percentages: {
          E: 25,
          I: 75,
          S: 18,
          N: 82,
          T: 68,
          F: 32,
          J: 71,
          P: 29
        },
        dominantTraits: {
          attitude: 'Introverted',
          perception: 'Intuitive',
          judgment: 'Thinking',
          lifestyle: 'Judging'
        },
        traitStrengths: {
          EI: 75,
          SN: 82,
          TF: 68,
          JP: 71
        }
      },
      questions: [
        {
          id: 'q1',
          text: 'How do you prefer to spend your free time?',
          category: 'EI'
        },
        {
          id: 'q2',
          text: 'How do you process information?',
          category: 'SN'
        }
      ],
      answers: [
        {
          questionId: 'q1',
          answer: 'Alone, reading or working on personal projects',
          category: 'EI'
        },
        {
          questionId: 'q2',
          answer: 'Looking for patterns and possibilities',
          category: 'SN'
        }
      ]
    };

    console.log('Making POST request to /api/test-results endpoint...');
    const testResultResponse = await axios.post(
      `${baseURL}/api/test-results`,
      testResult,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    ).catch(error => {
      console.error('Test result creation failed with error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });

    console.log('Test result created:', {
      status: testResultResponse.status,
      data: testResultResponse.data
    });

    // Now test story generation
    console.log('\nTesting story generation...');
    console.log(`Making POST request to /api/users/${userId}/generate-story endpoint...`);
    
    const storyResponse = await axios.post(
      `${baseURL}/api/users/${userId}/generate-story`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout for story generation
      }
    ).catch(error => {
      console.error('Story generation failed with error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        errno: error.errno,
        stack: error.stack
      });
      throw error;
    });

    console.log('\nStory generation successful:', {
      status: storyResponse.status,
      story: storyResponse.data.story
    });

  } catch (error) {
    console.error('Test failed with error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      type: error.constructor.name,
      response: error.response?.data
    });
    process.exit(1);
  }
}

console.log('Starting server test...');
testServer(); 