require('dotenv').config();
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://cursor-mbti.vercel.app',
      'https://cursor-mbti-jy10uyzsh-reflective-minds-projects.vercel.app',
      'https://cursor-mbti-4qxkqwvuk-reflective-minds-projects.vercel.app',
      'https://cursor-mbti-cp9py8d44-reflective-minds-projects.vercel.app',
      'https://cursor-mbti-meh28kc3w-reflective-minds-projects.vercel.app',
      'https://cursor-mbti-2z73umjte-reflective-minds-projects.vercel.app',
      'http://localhost:3000'
    ];
    callback(null, allowedOrigins.includes(origin) || !origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Add preflight handling
app.options('*', cors(corsOptions));

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: corsOptions.allowedHeaders
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false
});

// Add middleware to handle CORS preflight for WebSocket
app.use('/socket.io', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
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

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('Authentication error');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
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
  
  // Join user's channels
  const userChannels = await Channel.find({ 'members.user': socket.user._id });
  userChannels.forEach(channel => {
    socket.join(channel._id.toString());
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
      console.log('Joining channel:', channelId);
      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit('error', { message: 'Channel not found' });
        return;
      }

      if (!channel.isMember(socket.user._id)) {
        socket.emit('error', { message: 'Not a member of this channel' });
        return;
      }

      socket.join(channelId);
      
      // Get recent messages
      const messages = await Message.find({ channel: channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('author', 'username avatar status');
      
      console.log('Sending messages:', messages.length);
      socket.emit('channel:messages', messages.reverse());
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
      if (!channel || !channel.isMember(socket.user._id)) {
        socket.emit('error', { message: 'Cannot send message to this channel' });
        return;
      }

      // Check slow mode
      if (channel.slowMode.enabled) {
        const lastMessage = await Message.findOne({
          channel: channelId,
          author: socket.user._id
        }).sort({ createdAt: -1 });

        if (lastMessage) {
          const timeSinceLastMessage = Date.now() - lastMessage.createdAt;
          if (timeSinceLastMessage < (channel.slowMode.delay * 1000)) {
            socket.emit('error', { 
              message: `Slow mode is enabled. Please wait ${Math.ceil((channel.slowMode.delay * 1000 - timeSinceLastMessage) / 1000)} seconds.` 
            });
            return;
          }
        }
      }

      // Create and save message
      const message = new Message({
        content,
        author: socket.user._id,
        channel: channelId
      });
      
      await message.save();
      await message.populate('author', 'username avatar status');

      // Broadcast message to channel
      io.to(channelId).emit('message:new', message);

      // Update channel's last activity
      channel.lastActivity = new Date();
      await channel.save();
    } catch (error) {
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/personality', require('./routes/personality'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/community', require('./routes/community'));
app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 