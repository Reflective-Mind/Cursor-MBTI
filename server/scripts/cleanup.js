const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to database');

    // Delete all users
    const User = require('../models/User');
    const TestResult = require('../models/TestResult');

    console.log('Deleting all users and test results...');
    await User.deleteMany({});
    await TestResult.deleteMany({});

    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

cleanupDatabase(); 