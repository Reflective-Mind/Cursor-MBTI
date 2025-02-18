/**
 * MBTI Insights Server
 * ===================
 * Main server entry point
 * 
 * @lastValidated March 2024
 * @maintainer Development Team
 * @version 1.0
 */

// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Verify environment variables are loaded
console.log('Environment Check:', {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  hasMongoUri: !!process.env.MONGODB_URI,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasMistralKey: !!process.env.MISTRAL_API_KEY
});

// Load configuration validator
const ConfigValidator = require('./utils/configValidator');

// Validate all configurations before starting
try {
  ConfigValidator.validateAll();
  ConfigValidator.logConfigurationStatus();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  process.exit(1);
}

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      process.env.REACT_APP_API_URL || 'https://mbti-render.onrender.com'
    ],
    methods: ['GET', 'POST']
  }
});

// Load routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/community', require('./routes/community'));
app.use('/api/channels', require('./routes/channels'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 