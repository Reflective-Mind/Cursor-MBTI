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
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import ProfilePopup from '../components/ProfilePopup';
import AvatarWithPreview from '../components/AvatarWithPreview';

const Community = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channelMessages, setChannelMessages] = useState(() => {
    const savedMessages = localStorage.getItem('channelMessages');
    return savedMessages ? JSON.parse(savedMessages) : {};
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showUserList, setShowUserList] = useState(!isMobile);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const emojiPickerRef = useRef(null);

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
    setMessage(''); // Reset message input when changing channels
    
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
        // Filter out deleted messages and store in state
        const filteredMessages = channelMessages.filter(msg => !msg.deleted);
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
          const updated = [...filtered, newMessage];
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
    
    if (!message.trim() || !currentChannel || !socket || !socket.user) {
      console.error('Cannot send message: missing required data', {
        hasMessage: Boolean(message.trim()),
        hasChannel: Boolean(currentChannel),
        hasSocket: Boolean(socket),
        hasUser: Boolean(socket?.user)
      });
      return;
    }

    const messageContent = message.trim();
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

    setMessage('');
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
    setMessage(message.content);
    setMenuAnchor(null);
  };

  const handleDeleteMessage = (message) => {
    if (!socket || !message) return;
    
    // Emit the delete event first
    socket.emit('message:delete', message._id);
    
    // Update UI
    setMessages(prev => prev.filter(msg => msg._id !== message._id));
    setChannelMessages(prev => ({
      ...prev,
      [currentChannel._id]: prev[currentChannel._id].filter(msg => msg._id !== message._id)
    }));
  };

  const handleReaction = (messageId, emoji) => {
    if (!socket) return;
    
    // If emoji is not provided (clicking reaction button), show emoji picker
    if (!emoji) {
      setSelectedMessage({ _id: messageId });
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
    if (selectedMessage) {
      handleReaction(selectedMessage._id, emojiData.emoji);
      setSelectedMessage(null);
    } else {
      setMessage(prev => prev + emojiData.emoji);
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

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
        setSelectedMessage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', pt: 2 }}>
      <Box sx={{ 
        height: 'calc(100vh - 120px)', // Account for header and padding
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        overflow: 'hidden' // Prevent outer scrolling
      }}>
        {/* Channels sidebar */}
        <Paper sx={{ 
          width: 240,
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Channels</Typography>
          </Box>
          <List sx={{ 
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }
          }}>
            {channels.map((channel) => (
              <ListItemButton
                key={channel._id}
                selected={currentChannel?._id === channel._id}
                onClick={() => handleChannelSelect(channel)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ChatIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={channel.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Main chat area */}
        <Paper sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Channel header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            zIndex: 1
          }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon fontSize="small" />
              {currentChannel?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentChannel?.description}
            </Typography>
          </Box>

          {/* Messages container */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }
          }}>
            {messages.map((msg, index) => (
              <Box key={msg._id} sx={{ 
                display: 'flex', 
                mb: 1,
                alignItems: 'flex-start',
                position: 'relative',
                '&:hover .message-actions': {
                  opacity: 1
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }
              }}
              className="message-container">
                <AvatarWithPreview
                  src={msg.author.avatar ? `${process.env.REACT_APP_API_URL}/uploads/avatars/${msg.author.avatar}` : undefined}
                  alt={msg.author.username}
                  size="small"
                  isGold={msg.author.email === 'eideken@hotmail.com'}
                  onClick={() => handleProfileClick(msg.author._id, msg.author.username, msg.author.avatar)}
                  sx={{ mr: 1 }}
                >
                  {msg.author.username?.[0]?.toUpperCase()}
                </AvatarWithPreview>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" component="span">
                      {msg.author.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(msg.createdAt)}
                      {msg.edited && ' (edited)'}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </Typography>
                  {/* Combine reactions and reaction button in one container */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5, 
                    mt: 0.5,
                    alignItems: 'center'
                  }}>
                    {msg.reactions && msg.reactions.length > 0 && msg.reactions.map((reaction, index) => (
                      <Tooltip
                        key={`${reaction.emoji}-${index}`}
                        title={
                          <Box>
                            {reaction.users.map(userId => {
                              const user = users.find(u => u._id === userId);
                              return user ? user.username : 'Unknown user';
                            }).join(', ')}
                          </Box>
                        }
                        placement="top"
                      >
                        <Chip
                          label={`${reaction.emoji} ${reaction.users.length}`}
                          size="small"
                          onClick={() => handleReaction(msg._id, reaction.emoji)}
                          sx={{ 
                            backgroundColor: reaction.users.includes(socket?.user?._id) 
                              ? 'primary.dark' 
                              : 'background.paper',
                            '&:hover': {
                              backgroundColor: reaction.users.includes(socket?.user?._id)
                                ? 'primary.main'
                                : 'action.hover'
                            }
                          }}
                        />
                      </Tooltip>
                    ))}
                    {/* Inline reaction button */}
                    <IconButton
                      size="small"
                      onClick={() => handleReaction(msg._id)}
                      sx={{ 
                        padding: '2px',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '.message-container:hover &': {
                          opacity: 1
                        }
                      }}
                    >
                      <EmojiIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {socket?.user?._id === msg.author._id && (
                  <IconButton
                    className="message-actions"
                    size="small"
                    onClick={(e) => {
                      setSelectedMessage(msg);
                      setMenuAnchor(e.currentTarget);
                    }}
                    sx={{ 
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      position: 'absolute',
                      right: 8,
                      top: 0
                    }}
                  >
                    <MoreIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Box sx={{ 
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            position: 'relative' // For emoji picker positioning
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setMessage(e.target.value);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder={editingMessage ? 'Edit message...' : `Message #${currentChannel?.name}`}
              variant="outlined"
              error={message.length > 2000}
              helperText={`${message.length}/2000 characters${editingMessage ? ' (editing)' : ''}`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default'
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <EmojiIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {editingMessage && (
                  <Button 
                    variant="text" 
                    onClick={() => {
                      setEditingMessage(null);
                      setMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || message.length > 2000}
                >
                  {editingMessage ? 'Save' : 'Send'}
                </Button>
              </Box>
            </Box>
            {showEmojiPicker && (
              <Box 
                ref={emojiPickerRef}
                sx={{ 
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  zIndex: 1000,
                  boxShadow: 3,
                  backgroundColor: 'background.paper',
                  borderRadius: 1
                }}
              >
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Online users sidebar */}
        <Paper sx={{ 
          width: 200,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Online Users</Typography>
          </Box>
          <List sx={{ 
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }
          }}>
            {users
              .sort((a, b) => (a.status === 'online' ? -1 : 1))
              .map((user) => (
                <ListItem key={user._id}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color={user.status === 'online' ? 'success' : 'error'}
                    >
                      <Avatar 
                        src={user.avatar ? `${process.env.REACT_APP_API_URL}/uploads/avatars/${user.avatar}` : undefined}
                        onClick={() => handleProfileClick(user._id, user.username, user.avatar)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {user.username[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.username}
                    secondary={user.mbtiType}
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          handleEditMessage(selectedMessage);
          setMenuAnchor(null);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Message</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteMessage(selectedMessage);
          setMenuAnchor(null);
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