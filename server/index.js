// Load environment variables based on NODE_ENV
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());

if (process.env.NODE_ENV === 'production') {
  console.log('Loading production environment from:', './.env.production');
  require('dotenv').config({ path: './.env.production' });
} else {
  console.log('Loading development environment');
  require('dotenv').config();
}

console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing'
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Channel = require('./models/Channel');
const Message = require('./models/Message');

// Initialize express app
const app = express();
const server = http.createServer(app);

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
    timestamp: new Date().toISOString()
  });
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://cursor-mbti.vercel.app',
      'http://localhost:3000',
      'https://mbti-render.onrender.com',
      undefined // Allow requests with no origin (like mobile apps or curl requests)
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Add middleware to handle preflight requests
app.options('*', cors(corsOptions));

// Add middleware to set CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && corsOptions.origin(origin, (error, allowed) => allowed)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);
  }
  next();
});

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
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
app.post('/api/test-results-direct', (req, res) => {
  console.log('Direct test-results route hit:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  res.json({
    message: 'Direct test-results route is working',
    receivedData: {
      headers: req.headers,
      body: req.body
    }
  });
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

const authRouter = require('./routes/auth');
console.log('Loading auth routes...');
app.use('/api/auth', authRouter);

const usersRouter = require('./routes/users');
console.log('Loading users routes...');
app.use('/api/users', usersRouter);

console.log('Loading test-results routes...');
try {
  const testResultsRouter = require('./routes/testResults');
  if (!testResultsRouter || !testResultsRouter.stack) {
    console.error('Test results router is invalid:', testResultsRouter);
    throw new Error('Invalid router');
  }
  console.log('Test results router loaded successfully:', {
    routes: testResultsRouter.stack
      .filter(layer => layer.route)
      .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods)
      }))
  });
  app.use('/api/test-results', testResultsRouter);
} catch (error) {
  console.error('Error loading test results router:', {
    error: {
      message: error.message,
      stack: error.stack
    },
    cwd: process.cwd(),
    files: require('fs').readdirSync('./routes')
  });
}

const personalityRouter = require('./routes/personality');
console.log('Loading personality routes...');
app.use('/api/personality', personalityRouter);

const insightsRouter = require('./routes/insights');
console.log('Loading insights routes...');
app.use('/api/insights', insightsRouter);

const chatRouter = require('./routes/chat');
console.log('Loading chat routes...');
app.use('/api/chat', chatRouter);

const communityRouter = require('./routes/community');
console.log('Loading community routes...');
app.use('/api/community', communityRouter);

// Log all registered routes
console.log('\nRegistered routes:');
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
      allowedOrigins: corsOptions.allowedOrigins
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
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 