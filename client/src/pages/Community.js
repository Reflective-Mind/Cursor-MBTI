import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemButton,
  Avatar,
  Divider,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Drawer,
  useTheme,
  useMediaQuery,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  Tag as TagIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Circle as StatusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import ProfilePopup from '../components/ProfilePopup';
import { useAuth } from '../contexts/AuthContext';
import ChannelList from '../components/ChannelList';

const Community = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channelMessages, setChannelMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const chatContainerRef = useRef(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(channelMessages).length > 0) {
      localStorage.setItem('channelMessages', JSON.stringify(channelMessages));
    }
  }, [channelMessages]);

  // Define handleChannelSelect first
  const handleChannelSelect = React.useCallback((channel) => {
    console.log('Selecting channel:', channel);
    setCurrentChannel(channel);
    setError(null);
    setNewMessage(''); // Reset message input when changing channels
    
    // Load cached messages if they exist
    if (channelMessages[channel._id]) {
      setMessages(channelMessages[channel._id]);
      setIsLoading(false);
    } else {
      setMessages([]);
      setIsLoading(true);
    }
    
    if (socket) {
      // Leave current channel if any
      if (currentChannel) {
        socket.emit('channel:leave', currentChannel._id);
      }
      
      // Join new channel
      socket.emit('channel:join', channel._id);
    }
  }, [socket, currentChannel, channelMessages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      SOCKET_URL: process.env.REACT_APP_SOCKET_URL
    });

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL?.replace(/\/+$/, '') || '';
    const socketOptions = {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      extraHeaders: {
        'Authorization': `Bearer ${token}`
      }
    };

    const socket = io(socketUrl, socketOptions);

    setSocket(socket);

    socket.on('connect_error', (error) => {
      console.error('Test 2 - Socket connection error:', {
        message: error.message,
        description: error.description,
        context: {
          url: socketUrl,
          token: token ? 'Present' : 'Missing',
          transport: socket.io.engine.transport.name,
          readyState: socket.io.engine.readyState,
          connected: socket.connected,
          disconnected: socket.disconnected
        }
      });
      setError('Test 2 - Failed to connect to chat server. Retrying...');
    });

    socket.on('connect', () => {
      console.log('Test 2 - Connected to chat server successfully:', {
        transport: socket.io.engine.transport.name,
        id: socket.id
      });
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Test 2 - Disconnected from chat server:', {
        reason,
        wasConnected: socket.connected,
        transport: socket.io.engine.transport?.name
      });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try reconnecting
        console.log('Test 2 - Server initiated disconnect, attempting reconnect');
        socket.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Test 2 - Reconnected to chat server:', {
        attemptNumber,
        transport: socket.io.engine.transport.name
      });
      setError(null);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Test 2 - Socket reconnection error:', {
        message: error.message,
        type: error.type,
        description: error.description
      });
      setError('Test 2 - Unable to reconnect to chat server. Please refresh the page.');
    });

    socket.on('user:info', (userInfo) => {
      console.log('Test 2 - Received user info:', userInfo);
      socket.user = userInfo;
    });

    return () => {
      if (socket) {
        console.log('Test 2 - Cleaning up socket connection');
        socket.close();
      }
    };
  }, [navigate]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('channel:messages', (channelMessages) => {
      console.log('Test 3 - Received channel messages:', {
        count: channelMessages.length,
        channelId: currentChannel?._id
      });
      
      if (currentChannel) {
        // Filter out deleted messages and ensure roles are preserved
        const filteredMessages = channelMessages.filter(msg => !msg.deleted).map(msg => ({
          ...msg,
          author: {
            ...msg.author,
            roles: msg.author.roles || []
          }
        }));
        setChannelMessages(prev => ({
          ...prev,
          [currentChannel._id]: filteredMessages
        }));
        setMessages(filteredMessages);
        setIsLoading(false);
        scrollToBottom();
      }
    });

    socket.on('message:new', (newMessage) => {
      console.log('Test 3 - New message received:', {
        messageId: newMessage._id,
        channelId: newMessage.channel,
        currentChannel: currentChannel?._id
      });
      
      if (newMessage.channel.toString() === currentChannel?._id.toString()) {
        setMessages(prev => {
          const filtered = prev.filter(msg => !msg.temporary);
          // Ensure roles are preserved in new message
          const messageWithRoles = {
            ...newMessage,
            author: {
              ...newMessage.author,
              roles: newMessage.author.roles || []
            }
          };
          const updated = [...filtered, messageWithRoles];
          // Update channel messages cache
          setChannelMessages(prevChannelMessages => {
            const updatedCache = {
              ...prevChannelMessages,
              [currentChannel._id]: updated
            };
            localStorage.setItem('channelMessages', JSON.stringify(updatedCache));
            return updatedCache;
          });
          return updated;
        });
        scrollToBottom();
      }
    });

    socket.on('message:update', (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
      // Update channel messages cache with reactions
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel._id]: prev[currentChannel._id].map(msg =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      }));
    });

    socket.on('message:delete', (messageId) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
      // Update channel messages cache for deleted messages
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel._id]: prev[currentChannel._id].filter(msg => msg._id !== messageId)
      }));
    });

    socket.on('users:initial', (initialUsers) => {
      console.log('Initial users:', initialUsers);
      setUsers(initialUsers);
    });

    socket.on('user:status', ({ userId, status, username, avatar }) => {
      console.log('User status update:', { userId, status, username, avatar });
      setUsers((prev) => {
        const userExists = prev.find(u => u._id === userId);
        if (userExists) {
          return prev.map(user =>
            user._id === userId ? { ...user, status } : user
          );
        } else {
          return [...prev, { _id: userId, username, status, avatar }];
        }
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
      setIsLoading(false);
    });

    // Clean up event listeners
    return () => {
      socket.off('channel:messages');
      socket.off('message:new');
      socket.off('message:update');
      socket.off('message:delete');
      socket.off('users:initial');
      socket.off('user:status');
      socket.off('error');
    };
  }, [socket, currentChannel]);

  // Load initial channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        console.log('Test 3 - Fetching channels:', {
          url: `${process.env.REACT_APP_API_URL}/api/community/channels`,
          token: token ? 'Present' : 'Missing'
        });

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/community/channels`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Test 3 - Channels API response:', {
          status: response.status,
          ok: response.ok,
          channelCount: data.channels?.length,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch channels');
        }
        
        setChannels(data.channels);
        
        // Auto-join first channel if we have channels and socket and no current channel
        if (data.channels.length > 0 && socket && !currentChannel) {
          const firstChannel = data.channels[0];
          console.log('Test 3 - Auto-joining first channel:', {
            channelId: firstChannel._id,
            channelName: firstChannel.name
          });
          handleChannelSelect(firstChannel);
        }
      } catch (error) {
        console.error('Test 3 - Error fetching channels:', {
          message: error.message,
          env: {
            NODE_ENV: process.env.NODE_ENV,
            REACT_APP_API_URL: process.env.REACT_APP_API_URL,
            SOCKET_URL: process.env.REACT_APP_SOCKET_URL
          }
        });
        setError('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };

    if (socket && !channels.length) {
      fetchChannels();
    }
  }, [socket, handleChannelSelect, currentChannel, channels.length]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !currentChannel || !socket || !socket.user) {
      console.error('Cannot send message: missing required data', {
        hasMessage: Boolean(newMessage.trim()),
        hasChannel: Boolean(currentChannel),
        hasSocket: Boolean(socket),
        hasUser: Boolean(socket?.user)
      });
      return;
    }

    const messageContent = newMessage.trim();
    console.log('Sending message:', {
      channelId: currentChannel._id,
      content: messageContent
    });

    if (editingMessage) {
      // Update UI optimistically for edit
      setMessages(prev => prev.map(msg => 
        msg._id === editingMessage._id 
          ? { ...msg, content: messageContent, edited: true }
          : msg
      ));
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel._id]: prev[currentChannel._id].map(msg =>
          msg._id === editingMessage._id
            ? { ...msg, content: messageContent, edited: true }
            : msg
        )
      }));

      // Emit edit event
      socket.emit('message:edit', {
        messageId: editingMessage._id,
        content: messageContent
      });
      setEditingMessage(null);
    } else {
      // Optimistically add new message to UI
      const optimisticMessage = {
        _id: Date.now().toString(),
        content: messageContent,
        author: {
          _id: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar,
          status: 'online'
        },
        createdAt: new Date(),
        temporary: true,
        reactions: []
      };
      setMessages(prev => [...prev, optimisticMessage]);
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel._id]: [...(prev[currentChannel._id] || []), optimisticMessage]
      }));

      // Emit new message event
      socket.emit('message:new', {
        channelId: currentChannel._id,
        content: messageContent
      });
    }

    setNewMessage('');
    setShowEmojiPicker(false);
    scrollToBottom();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setAnchorEl(null);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!currentChannel || !messageId) {
      console.error('No channel selected or invalid message ID');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/community/channels/${currentChannel._id}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete message');
      }

      // Update UI
      setMessages(prev => prev.filter(m => m._id !== messageId));
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel._id]: prev[currentChannel._id].filter(m => m._id !== messageId)
      }));

      // Emit socket event
      if (socket) {
        socket.emit('message:delete', {
          channelId: currentChannel._id,
          messageId
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError(error.message || 'Failed to delete message');
    }
  };

  const handleDeleteChannel = async (channelId) => {
    try {
      if (!user?.roles?.includes('admin')) {
        setError('Only admins can delete channels');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this channel?')) {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/community/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete channel');
      }

      // Update channels list
      setChannels(prevChannels => prevChannels.filter(c => c._id !== channelId));

      // If deleting current channel, switch to another one
      if (currentChannel?._id === channelId) {
        const remainingChannels = channels.filter(c => c._id !== channelId);
        if (remainingChannels.length > 0) {
          handleChannelSelect(remainingChannels[0]);
        } else {
          setCurrentChannel(null);
          setMessages([]);
        }
      }

      // Clear channel messages from cache
      setChannelMessages(prev => {
        const updated = { ...prev };
        delete updated[channelId];
        return updated;
      });
    } catch (error) {
      console.error('Error deleting channel:', error);
      setError(error.message || 'Failed to delete channel');
    }
  };

  const handleClearChannel = async () => {
    try {
      if (!user?.roles?.includes('admin')) {
        setError('Only admins can clear channels');
        return;
      }

      if (!currentChannel) {
        setError('No channel selected');
        return;
      }

      if (!window.confirm('Are you sure you want to clear all messages in this channel?')) {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/community/channels/${currentChannel._id}/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to clear channel');
      }

      // Clear messages in the current channel
      setMessages([]);
      
      // Update channel messages cache
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel._id]: []
      }));

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('channel:clear', {
          channelId: currentChannel._id
        });
      }
    } catch (error) {
      console.error('Error clearing channel:', error);
      setError(error.message || 'Failed to clear channel');
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (!socket) return;
    
    // If emoji is not provided (clicking reaction button), show emoji picker
    if (!emoji) {
      setSelectedEmoji({ _id: messageId });
      setShowEmojiPicker(true);
      return;
    }
    
    // Emit reaction event
    socket.emit('message:react', { messageId, emoji });
    
    // Update UI optimistically
    const updateMessages = (messages) => messages.map(msg => {
      if (msg._id !== messageId) return msg;
      
      const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
      if (existingReaction) {
        // Remove user from reaction if they already reacted
        if (existingReaction.users.includes(socket.user._id)) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, users: r.users.filter(userId => userId !== socket.user._id) }
                : r
            ).filter(r => r.users.length > 0)
          };
        }
        // Add user to existing reaction
        return {
          ...msg,
          reactions: msg.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, users: [...r.users, socket.user._id] }
              : r
          )
        };
      }
      // Add new reaction
      return {
        ...msg,
        reactions: [...(msg.reactions || []), { emoji, users: [socket.user._id] }]
      };
    });

    // Update both messages state and channel messages cache
    setMessages(prev => updateMessages(prev));
    setChannelMessages(prev => ({
      ...prev,
      [currentChannel._id]: updateMessages(prev[currentChannel._id] || [])
    }));
    
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emojiData) => {
    if (selectedEmoji) {
      handleReaction(selectedEmoji._id, emojiData.emoji);
      setSelectedEmoji(null);
    } else {
      setNewMessage(prev => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event) => {
    // File upload implementation will be added
    console.log('File upload:', event.target.files[0]);
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileClick = (userId, username, avatar) => {
    // Check if userId exists and is valid
    if (!userId) return;
    
    // Open profile popup instead of navigating
    setSelectedProfile({
      userId,
      username,
      avatar
    });
  };

  const getChannelEmoji = (channelName) => {
    const name = channelName.toLowerCase();
    if (name.includes('general')) return '💬';
    if (name.includes('introvert') || name.includes('intj') || name.includes('intp')) return '🤔';
    if (name.includes('extrovert') || name.includes('entj') || name.includes('entp')) return '🗣️';
    if (name.includes('feeling') || name.includes('infj') || name.includes('infp')) return '❤️';
    if (name.includes('thinking') || name.includes('istj') || name.includes('istp')) return '🧠';
    if (name.includes('sensing') || name.includes('esfj') || name.includes('esfp')) return '👀';
    if (name.includes('intuition') || name.includes('enfj') || name.includes('enfp')) return '✨';
    if (name.includes('judging')) return '📋';
    if (name.includes('perceiving')) return '🔍';
    if (name.includes('announcement')) return '📢';
    if (name.includes('help')) return '❓';
    if (name.includes('off-topic')) return '💭';
    return '🌟';
  };

  const handleCreateChannel = async () => {
    if (!user?.roles?.includes('admin')) {
      setError('Only admins can create channels');
      return;
    }
    
    const channelName = prompt('Enter channel name:');
    if (!channelName?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Creating channel:', { channelName });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/community/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: channelName.trim(),
          description: `Channel for ${channelName.trim()}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create channel');
      }

      // Update channels list with new channel
      setChannels(prevChannels => [...prevChannels, data]);
      
      // Initialize empty message cache for new channel
      setChannelMessages(prev => ({
        ...prev,
        [data._id]: []
      }));
      
      // Switch to the new channel
      handleChannelSelect(data);
      
    } catch (error) {
      console.error('Error creating channel:', error);
      setError(error.message || 'Failed to create channel');
    }
  };

  const handleMenuOpen = (event, msg) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(msg);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, height: 'calc(100vh - 120px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={3}>
          {/* Channel list */}
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <List>
              <ListItem>
                <Typography variant="h6">Channels</Typography>
                {user.roles?.includes('admin') && (
                  <IconButton
                    color="primary"
                    onClick={handleCreateChannel}
                    sx={{ ml: 'auto' }}
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </ListItem>
              <Divider />
              {channels.map((channel) => (
                <ListItemButton
                  key={channel._id}
                  selected={currentChannel?._id === channel._id}
                  onClick={() => handleChannelSelect(channel)}
                >
                  <ListItemIcon>
                    {getChannelEmoji(channel.name)}
                  </ListItemIcon>
                  <ListItemText primary={channel.name} />
                  {user.roles?.includes('admin') && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChannel(channel._id);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Channel header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {currentChannel?.name}
              </Typography>
              {user.roles?.includes('admin') && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearChannel}
                >
                  Clear Channel
                </Button>
              )}
            </Box>
            
            {/* Messages container */}
            <Box
              ref={chatContainerRef}
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    '&:hover .message-actions': {
                      opacity: 1
                    }
                  }}
                >
                  <Avatar
                    src={message.author.avatar}
                    alt={message.author.username}
                    onClick={() => handleProfileClick(message.author._id, message.author.username, message.author.avatar)}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      cursor: 'pointer',
                      ...(message.author.roles?.includes('admin') && {
                        border: '2px solid #FFD700',
                        boxShadow: '0 0 10px #FFD700'
                      })
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          color: message.author.roles?.includes('admin') ? '#FFD700' : 'inherit'
                        }}
                      >
                        {message.author.username}
                        {message.author.roles?.includes('admin') && ' (Admin)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(message.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{message.content}</Typography>
                  </Box>
                  {(message.author._id === socket?.user?._id || user?.roles?.includes('admin')) && (
                    <Box 
                      className="message-actions" 
                      sx={{ 
                        opacity: 0, 
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMessage(message._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            
            {/* Message input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <form onSubmit={handleSendMessage}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    color={showEmojiPicker ? 'primary' : 'default'}
                    disabled={!currentChannel}
                  >
                    <EmojiIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!currentChannel}
                  >
                    <AttachFileIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${currentChannel ? `#${currentChannel.name}` : ''}`}
                    variant="outlined"
                    size="small"
                    disabled={!currentChannel}
                    sx={{
                      backgroundColor: 'background.paper',
                      '& .MuiInputBase-root': {
                        cursor: 'text'
                      }
                    }}
                  />
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!newMessage.trim() || !currentChannel}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </form>
              {showEmojiPicker && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: selectedMessage ? 'auto' : '80px',
                    right: selectedMessage ? '50px' : '16px',
                    top: selectedMessage ? '50%' : 'auto',
                    transform: selectedMessage ? 'translateY(-50%)' : 'none',
                    zIndex: 1000,
                  }}
                >
                  <Paper elevation={3}>
                    <Box sx={{ p: 1 }}>
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        width={320}
                        height={450}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedMessage) {
            handleDeleteMessage(selectedMessage._id);
            handleMenuClose();
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Message</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add ProfilePopup */}
      <ProfilePopup
        userId={selectedProfile?.userId}
        username={selectedProfile?.username}
        avatar={selectedProfile?.avatar}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </Container>
  );
};

export default Community; 