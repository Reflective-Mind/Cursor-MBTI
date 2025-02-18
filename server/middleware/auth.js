const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('Initializing auth middleware');

const auth = async (req, res, next) => {
  console.log('Auth middleware started:', {
    path: req.path,
    method: req.method,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
    },
    timestamp: new Date().toISOString()
  });

  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Token received, verifying...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Token verified, finding user:', {
      userId: decoded.userId
    });

    // Find user with roles
    const user = await User.findById(decoded.userId).select('+roles');
    
    if (!user) {
      console.log('User not found:', {
        userId: decoded.userId
      });
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found, updating last active');

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      roles: user.roles || []
    };
    req.token = token;

    console.log('Auth middleware completed successfully:', {
      userId: decoded.userId,
      roles: user.roles,
      path: req.path,
      method: req.method
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user.roles?.includes('admin')) {
      console.log('Admin access denied:', {
        userId: req.user.userId,
        roles: req.user.roles,
        path: req.path
      });
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ message: 'Error checking admin status' });
  }
};

module.exports = {
  auth,
  isAdmin
}; 