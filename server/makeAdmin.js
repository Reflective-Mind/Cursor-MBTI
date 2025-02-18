require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    if (!user.roles.includes('admin')) {
      user.roles.push('admin');
      await user.save();
      console.log(`User ${user.email} is now an admin`);
    } else {
      console.log(`User ${user.email} is already an admin`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

makeAdmin(email); 