// Load environment variables based on NODE_ENV
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());

const path = require('path');

if (process.env.NODE_ENV === 'production') {
  console.log('Loading production environment from:', path.join(__dirname, '.env.production'));
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
} else {
  console.log('Loading development environment from:', path.join(__dirname, '.env'));
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

// Add detailed environment variable logging
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing',
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY ? `Present (length: ${process.env.MISTRAL_API_KEY.length})` : 'Missing',
  ENV_FILE_PATH: path.join(__dirname, '.env'),
  CURRENT_DIR: __dirname
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Register models
require('./models/User');
require('./models/Channel');
require('./models/Message');
require('./models/TestResult');

// Import model instances
const User = require('./models/User');
const Channel = require('./models/Channel');
const Message = require('./models/Message');
const TestResult = require('./models/TestResult');
const auth = require('./middleware/auth');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing',
      'origin': req.headers.origin
    },
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString(),
    registeredRoutes: app._router?.stack
      ?.filter(r => r.route || r.name === 'router')
      ?.map(r => ({
        type: r.name,
        path: r.route?.path || (r.regexp?.toString().match(/^\/\^\\(.*?)\\\//)?.[1] || ''),
        methods: r.route ? Object.keys(r.route.methods) : undefined
      }))
  });
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add middleware to handle preflight requests
app.options('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://mbti-render.onrender.com',
    'https://cursor-mbti.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Add middleware to set CORS headers for all responses
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://mbti-render.onrender.com',
    'https://cursor-mbti.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  next();
});

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false,
  connectTimeout: 45000
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve static files from public directory
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize channels if none exist
    const channelCount = await Channel.countDocuments();
    if (channelCount === 0) {
      const defaultChannels = [
        {
          name: 'general',
          description: 'General discussion for all MBTI types',
          category: 'general',
          type: 'text'
        },
        {
          name: 'introvert-corner',
          description: 'A cozy space for introverts to connect',
          category: 'mbti-types',
          type: 'text'
        },
        {
          name: 'extrovert-plaza',
          description: 'High-energy discussions for extroverts',
          category: 'mbti-types',
          type: 'text'
        }
      ];

      for (const channelData of defaultChannels) {
        const channel = new Channel(channelData);
        await channel.save();
        console.log(`Created channel: ${channel.name}`);
      }
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO Authentication Middleware with better error handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error(error.message || 'Authentication failed'));
  }
});

// Socket.IO Connection Handler
io.on('connection', async (socket) => {
  console.log('User connected:', socket.user.username);
  
  // Update user status to online
  socket.user.status = 'online';
  await socket.user.save();
  
  // Send user info to the client
  socket.emit('user:info', {
    _id: socket.user._id,
    username: socket.user.username,
    avatar: socket.user.avatar,
    status: socket.user.status
  });

  // Auto-join general channel for new users
  try {
    const generalChannel = await Channel.findOne({ name: 'general' });
    if (generalChannel && !generalChannel.members.find(m => m.user.toString() === socket.user._id.toString())) {
      generalChannel.members.push({
        user: socket.user._id,
        roles: ['member']
      });
      await generalChannel.save();
    }
  } catch (error) {
    console.error('Error auto-joining general channel:', error);
  }
  
  // Join user's channels
  const userChannels = await Channel.find({ 'members.user': socket.user._id });
  userChannels.forEach(channel => {
    socket.join(channel._id.toString());
    console.log(`${socket.user.username} joined channel: ${channel.name}`);
  });
  
  // Broadcast user's online status with full user info
  io.emit('user:status', {
    userId: socket.user._id,
    status: 'online',
    username: socket.user.username,
    avatar: socket.user.avatar
  });

  // Send current online users to the newly connected user
  const onlineUsers = await User.find({ status: 'online' });
  socket.emit('users:initial', onlineUsers.map(user => ({
    _id: user._id,
    username: user.username,
    status: user.status,
    avatar: user.avatar
  })));

  // Handle joining a channel
  socket.on('channel:join', async (channelId) => {
    try {
      console.log(`${socket.user.username} attempting to join channel:`, channelId);
      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit('error', { message: 'Channel not found' });
        return;
      }

      // Add user to channel if not already a member
      if (!channel.members.find(m => m.user.toString() === socket.user._id.toString())) {
        channel.members.push({
          user: socket.user._id,
          roles: ['member']
        });
        await channel.save();
      }

      socket.join(channelId);
      
      // Get recent messages with populated author info
      const messages = await Message.find({ channel: channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('author', 'username avatar status')
        .lean();
      
      console.log(`Sending ${messages.length} messages to ${socket.user.username}`);
      socket.emit('channel:messages', messages.reverse());

      // Notify channel about new member
      io.to(channelId).emit('channel:user_joined', {
        userId: socket.user._id,
        username: socket.user.username,
        channelId: channel._id
      });
    } catch (error) {
      console.error('Error joining channel:', error);
      socket.emit('error', { message: 'Error joining channel' });
    }
  });

  // Handle leaving a channel
  socket.on('channel:leave', (channelId) => {
    socket.leave(channelId);
  });

  // Handle new message
  socket.on('message:new', async (data) => {
    try {
      const { channelId, content } = data;
      
      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit('error', { message: 'Channel not found' });
        return;
      }

      // Ensure user is a member of the channel
      if (!channel.members.find(m => m.user.toString() === socket.user._id.toString())) {
        channel.members.push({
          user: socket.user._id,
          roles: ['member']
        });
        await channel.save();
      }

      // Create and save message
      const message = new Message({
        content,
        author: socket.user._id,
        channel: channelId,
        createdAt: new Date()
      });
      
      await message.save();
      
      // Populate author information before broadcasting
      await message.populate('author', 'username avatar status');

      // Broadcast message to channel
      io.to(channelId).emit('message:new', message);

      // Update channel's last activity
      channel.lastActivity = new Date();
      await channel.save();

      // Update channel messages in memory
      console.log(`Message saved and broadcast to channel ${channel.name}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle message edit
  socket.on('message:edit', async (data) => {
    try {
      const { messageId, content } = data;
      
      const message = await Message.findById(messageId);
      if (!message || message.author.toString() !== socket.user._id.toString()) {
        socket.emit('error', { message: 'Cannot edit this message' });
        return;
      }

      message.content = content;
      message.edited = true;
      message.editedAt = new Date();
      await message.save();
      await message.populate('author', 'username avatar status');

      io.to(message.channel.toString()).emit('message:update', message);
    } catch (error) {
      socket.emit('error', { message: 'Error editing message' });
    }
  });

  // Handle message delete
  socket.on('message:delete', async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || message.author.toString() !== socket.user._id.toString()) {
        socket.emit('error', { message: 'Cannot delete this message' });
        return;
      }

      // Instead of just marking as deleted, actually remove the message
      await Message.deleteOne({ _id: messageId });

      io.to(message.channel.toString()).emit('message:delete', messageId);
    } catch (error) {
      socket.emit('error', { message: 'Error deleting message' });
    }
  });

  // Handle message reaction
  socket.on('message:react', async (data) => {
    try {
      const { messageId, emoji } = data;
      
      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      const existingReaction = message.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        const userIndex = existingReaction.users.indexOf(socket.user._id);
        if (userIndex > -1) {
          existingReaction.users.splice(userIndex, 1);
          if (existingReaction.users.length === 0) {
            message.reactions = message.reactions.filter(r => r.emoji !== emoji);
          }
        } else {
          existingReaction.users.push(socket.user._id);
        }
      } else {
        message.reactions.push({
          emoji,
          users: [socket.user._id]
        });
      }

      await message.save();
      await message.populate('author', 'username avatar status');
      io.to(message.channel.toString()).emit('message:update', message);
    } catch (error) {
      console.error('Error handling reaction:', error);
      socket.emit('error', { message: 'Error reacting to message' });
    }
  });

  // Handle typing indicator
  socket.on('typing:start', (channelId) => {
    socket.to(channelId).emit('typing:start', {
      userId: socket.user._id,
      username: socket.user.username
    });
  });

  socket.on('typing:stop', (channelId) => {
    socket.to(channelId).emit('typing:stop', {
      userId: socket.user._id
    });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.user.username);
    
    socket.user.status = 'offline';
    socket.user.lastActive = new Date();
    await socket.user.save();

    io.emit('user:status', {
      userId: socket.user._id,
      status: 'offline'
    });
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MBTI Server is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    routes: app._router.stack
      .filter(r => r.route)
      .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }))
  });
});

// Test route to verify routing is working
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test route is working',
    routes: app._router.stack
      .filter(r => r.name === 'router')
      .map(r => ({
        regexp: r.regexp.toString(),
        path: r.regexp.toString().match(/^\/\^\\(.*?)\\\//)?.[1] || '',
        handle: {
          name: r.handle.name,
          stack: r.handle.stack.map(layer => ({
            name: layer.name,
            route: layer.route ? {
              path: layer.route.path,
              methods: Object.keys(layer.route.methods)
            } : undefined
          }))
        }
      }))
  });
});

// Direct test route for test-results
app.post('/api/test-results-direct', auth, async (req, res) => {
  try {
    console.log('Direct test-results route hit:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Check if a result for this test category already exists
    const existingResult = await TestResult.findOne({
      user: req.user.userId,
      testCategory: req.body.testCategory
    });

    let savedResult;
    if (existingResult) {
      console.log('Updating existing test result:', {
        resultId: existingResult._id,
        testCategory: req.body.testCategory
      });
      // Update existing result
      existingResult.result = req.body.result;
      existingResult.analysisVersion += 1;
      savedResult = await existingResult.save();
    } else {
      console.log('Creating new test result');
      // Create new result
      const testResult = new TestResult({
        user: req.user.userId,
        testCategory: req.body.testCategory,
        result: req.body.result
      });
      savedResult = await testResult.save();
    }

    // Calculate weighted personality type
    const weightedResult = await TestResult.calculateWeightedType(req.user.userId);
    
    if (weightedResult) {
      console.log('Updating user MBTI type with weighted calculation:', {
        userId: req.user.userId,
        oldType: req.body.result.type,
        newType: weightedResult.type,
        testBreakdown: weightedResult.testBreakdown
      });

      // Update user's MBTI type with weighted result
      const user = await User.findById(req.user.userId);
      user.mbtiType = weightedResult.type;
      user.personalityTraits = [
        { trait: 'Extroversion-Introversion', strength: weightedResult.percentages.E },
        { trait: 'Sensing-Intuition', strength: weightedResult.percentages.S },
        { trait: 'Thinking-Feeling', strength: weightedResult.percentages.T },
        { trait: 'Judging-Perceiving', strength: weightedResult.percentages.J }
      ];
      
      // Generate and store profile sections
      const profileSections = await user.getProfileSections();
      user.profileSections = profileSections;
      await user.save();

      // Add weighted calculation and profile sections to the response
      savedResult = {
        ...savedResult.toObject(),
        weightedResult,
        sections: profileSections,
        profileSections
      };
    }

    res.json(savedResult);
  } catch (error) {
    console.error('Error in direct test-results route:', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.user?.userId,
      testType: req.body?.testCategory,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: 'Error storing test results',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test routes for debugging
app.get('/api/debug/routes', (req, res) => {
  const routes = app._router.stack
    .filter(r => r.route || r.name === 'router')
    .map(r => ({
      type: r.name,
      path: r.route?.path || (r.regexp?.toString().match(/^\/\^\\(.*?)\\\//)?.[1] || ''),
      methods: r.route ? Object.keys(r.route.methods) : undefined,
      stack: r.handle?.stack?.length || r.stack?.length
    }));

  res.json({
    message: 'Debug route information',
    routes,
    env: process.env.NODE_ENV,
    cwd: process.cwd(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug/test-results', (req, res) => {
  try {
    const routePath = './routes/testResults.js';
    const exists = require('fs').existsSync(routePath);
    const router = exists ? require(routePath) : null;

    res.json({
      message: 'Test results router debug information',
      fileExists: exists,
      routerLoaded: !!router,
      hasStack: !!router?.stack,
      stackSize: router?.stack?.length || 0,
      routes: router?.stack
        ?.filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        })) || [],
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error getting test results router information',
      error: {
        message: error.message,
        name: error.name
      }
    });
  }
});

// Log registered routes
const logRoutes = (stack, prefix = '') => {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods);
      console.log(`Route registered: [${methods.join(', ')}] ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router') {
      const newPrefix = prefix + (layer.regexp.toString().match(/^\/\^\\(.*?)\\\//)?.[1] || '');
      console.log(`Router mounted at: ${newPrefix}`);
      logRoutes(layer.handle.stack, newPrefix);
    }
  });
};

// API routes with logging
console.log('\nRegistering API routes...');

// Import routers
const testResultsRouter = require('./routes/testResults');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const personalityRouter = require('./routes/personality');
const insightsRouter = require('./routes/insights');
const chatRouter = require('./routes/chat');
const communityRouter = require('./routes/community');
const adminRoutes = require('./routes/admin');

// Debug route to check router status
app.get('/api/debug/status', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    routers: {
      testResults: !!testResultsRouter,
      auth: !!authRouter,
      users: !!usersRouter,
      personality: !!personalityRouter,
      insights: !!insightsRouter,
      chat: !!chatRouter,
      community: !!communityRouter,
      admin: !!adminRoutes
    }
  });
});

// Mount routers with explicit logging
console.log('Mounting test-results router...');
app.use('/api/test-results', testResultsRouter);

console.log('Mounting other routers...');
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/personality', personalityRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/community', communityRouter);

// Add admin routes
app.use('/api/admin', adminRoutes);

// Log all registered routes after mounting
console.log('All routes mounted. Registered routes:');
logRoutes(app._router.stack);

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log('404 - Route not found:', {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: req.headers,
    params: req.params,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
    registeredRoutes: app._router.stack
      .filter(r => r.route || r.name === 'router')
      .map(r => ({
        type: r.name,
        path: r.route?.path || (r.regexp?.toString().match(/^\/\^\\(.*?)\\\//)?.[1] || ''),
        methods: r.route ? Object.keys(r.route.methods) : undefined
      }))
  });
  res.status(404).json({
    message: 'Route not found',
    requestedPath: req.path,
    availableRoutes: app._router.stack
      .filter(r => r.route || r.name === 'router')
      .map(r => ({
        type: r.name,
        path: r.route?.path || (r.regexp?.toString().match(/^\/\^\\(.*?)\\\//)?.[1] || ''),
        methods: r.route ? Object.keys(r.route.methods) : undefined
      }))
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    headers: req.headers,
    method: req.method,
    url: req.url,
    path: req.path,
    origin: req.headers.origin,
    body: req.body,
    query: req.query,
    params: req.params,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    },
    timestamp: new Date().toISOString()
  });

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS error',
      details: err.message,
      origin: req.headers.origin,
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3002']
    });
  }

  res.status(500).json({
    message: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.path,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 