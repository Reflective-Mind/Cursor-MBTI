require('dotenv').config();

console.log('Testing Mistral client initialization...');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY ? 'Present' : 'Missing'
});

async function testMistral() {
  try {
    console.log('\nStarting Mistral client test...\n');

    console.log('Step 1: Importing Mistral SDK...');
    const mistralai = await import('@mistralai/mistralai');

    console.log('Step 2: Initializing Mistral client...');
    const client = new mistralai.default(process.env.MISTRAL_API_KEY);
    
    console.log('Available client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
    console.log('Client object keys:', Object.keys(client));

    console.log('Step 3: Testing API connection...');
    const chatResponse = await client.chat({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log('✅ Test completed successfully!');
    console.log('Chat response:', chatResponse);

  } catch (error) {
    console.log('❌ Error during testing:', error.message);
    console.log('Error details:', error);
    process.exit(1);
  }
}

// Execute the test
testMistral();

// Run the test
console.log('\nStarting Mistral client test...\n');
testMistral()
  .then(() => {
    console.log('\n✓ All tests completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }); 