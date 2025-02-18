const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Channel = require('../models/Channel');
const User = require('../models/User');

// Get all channels
router.get('/', auth, async (req, res) => {
  try {
    const channels = await Channel.find({})
      .populate('members.user', 'username avatar status')
      .lean();
    res.json(channels);
  } catch (error) {
    console.error('Error getting channels:', error);
    res.status(500).json({ message: 'Error getting channels' });
  }
});

// Get channel messages
router.get('/:channelId/messages', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate({
        path: 'messages.author',
        select: 'username avatar roles'
      })
      .populate({
        path: 'messages.reactions.user',
        select: 'username avatar'
      });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Filter out messages from deleted users and clean up reactions
    const validMessages = channel.messages.filter(msg => msg.author).map(msg => ({
      ...msg.toObject(),
      author: {
        ...msg.author.toObject(),
        roles: msg.author.roles || ['user']
      },
      reactions: msg.reactions.filter(reaction => reaction.user)
    }));

    // Update channel with cleaned messages
    channel.messages = validMessages;
    await channel.save();

    res.json(validMessages);
  } catch (error) {
    console.error('Error getting channel messages:', error);
    res.status(500).json({ message: 'Error getting channel messages' });
  }
});

// Delete a message
router.delete('/:channelId/messages/:messageId', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const message = channel.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Get the user with roles
    const user = await User.findById(req.user.userId).select('roles');
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Check if user is message author or admin
    if (message.author.toString() !== req.user.userId && !user.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    channel.messages.pull(message._id);
    await channel.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

// Clear all messages in a channel (admin only)
router.delete('/:channelId/clear', auth, async (req, res) => {
  try {
    // Get the user with roles
    const user = await User.findById(req.user.userId).select('roles');
    if (!user?.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Only admins can clear channels' });
    }

    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    channel.messages = [];
    await channel.save();

    res.json({ message: 'Channel cleared successfully' });
  } catch (error) {
    console.error('Error clearing channel:', error);
    res.status(500).json({ message: 'Error clearing channel' });
  }
});

// Create a new channel (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Only admins can create channels' });
    }

    const { name, description, isPrivate } = req.body;

    const channel = new Channel({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user.userId,
      members: [{ user: req.user.userId, roles: ['admin'] }]
    });

    await channel.save();
    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ message: 'Error creating channel' });
  }
});

// Delete a channel (admin only)
router.delete('/:channelId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId).select('roles');
    if (!user?.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Only admins can delete channels' });
    }

    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    await Channel.deleteOne({ _id: req.params.channelId });
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ message: 'Error deleting channel' });
  }
});

module.exports = router; 