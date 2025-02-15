require('dotenv').config();

console.log('Testing Mistral client initialization...');

try {
  const mistralai = require('@mistralai/mistralai');
  console.log('Available exports:', Object.keys(mistralai));
  
  const Mistral = mistralai.Mistral;
  console.log('Mistral:', typeof Mistral);
  
  if (process.env.MISTRAL_API_KEY) {
    const client = new Mistral(process.env.MISTRAL_API_KEY);
    console.log('Client initialized successfully:', client);
  } else {
    console.log('No API key found');
  }
} catch (error) {
  console.error('Error:', error);
} 