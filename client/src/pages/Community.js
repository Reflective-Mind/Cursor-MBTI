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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_SOCKET_URL
  : 'http://localhost:5000';

console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  SOCKET_URL
});

const Community = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channelMessages, setChannelMessages] = useState({});
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

  // Add authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate]);

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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      console.log('Initializing socket connection to:', SOCKET_URL);
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setSocket(newSocket);
        setError(null);
      });

      newSocket.on('user:info', (userInfo) => {
        console.log('Received user info:', userInfo);
        newSocket.user = userInfo;
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', {
          message: error.message,
          description: error.description,
          context: {
            url: SOCKET_URL,
            token: token ? 'Present' : 'Missing'
          }
        });
        setError('Failed to connect to chat server');
      });

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.error('Socket initialization error:', error);
      setError('Failed to initialize chat connection');
    }
  }, [navigate]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('channel:messages', (channelMessages) => {
      console.log('Received messages:', channelMessages);
      if (currentChannel) {
        // Filter out deleted messages when loading channel messages
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
      console.log('New message received:', newMessage);
      if (newMessage.channel.toString() === currentChannel?._id.toString()) {
        setMessages(prev => {
          // Remove optimistic message if it exists
          const filtered = prev.filter(msg => !msg.temporary);
          const updated = [...filtered, newMessage];
          // Update channel messages
          setChannelMessages(prevChannelMessages => ({
            ...prevChannelMessages,
            [currentChannel._id]: updated
          }));
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
    });

    socket.on('message:delete', (messageId) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
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
        console.log('Fetching channels:', {
          url: `${process.env.REACT_APP_API_URL}/api/community/channels`,
          token: token ? 'Present' : 'Missing'
        });

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/community/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Channels API response:', {
          status: response.status,
          ok: response.ok,
          data,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch channels');
        }
        
        setChannels(data.channels);
        
        // Auto-join first channel if we have channels and socket
        if (data.channels.length > 0 && socket) {
          handleChannelSelect(data.channels[0]);
        }
      } catch (error) {
        console.error('Error fetching channels:', {
          message: error.message,
          env: {
            NODE_ENV: process.env.NODE_ENV,
            REACT_APP_API_URL: process.env.REACT_APP_API_URL,
            SOCKET_URL
          }
        });
        setError('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };

    if (socket) {
      fetchChannels();
    }
  }, [socket, handleChannelSelect]);

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
    setMessages(prev => prev.map(msg => {
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

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', pt: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Channels Sidebar */}
        <Grid item xs={12} md={2}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <List>
              <ListItem>
                <Typography variant="h6">Channels</Typography>
              </ListItem>
              <Divider />
              {channels.map((channel) => (
                <ListItemButton
                  key={channel._id}
                  selected={currentChannel?._id === channel._id}
                  onClick={() => handleChannelSelect(channel)}
                >
                  <ListItemIcon>
                    <TagIcon />
                  </ListItemIcon>
                  <ListItemText primary={channel.name} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Chat Area */}
        <Grid item xs={12} md={showUserList ? 7 : 10}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Channel Header */}
            {currentChannel && (
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  # {currentChannel.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentChannel.description}
                </Typography>
              </Box>
            )}

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {messages.map((msg, index) => (
                    <ListItem
                      key={msg._id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                          '& .message-actions': {
                            display: 'flex',
                          },
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          color={msg.author.status === 'online' ? 'success' : 'error'}
                        >
                          <Avatar 
                            src={msg.author.avatar}
                            onClick={() => handleProfileClick(msg.author.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            {msg.author.username[0]}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {msg.author.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(msg.createdAt)}
                            </Typography>
                            {msg.edited && (
                              <Typography variant="caption" color="text.secondary">
                                (edited)
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body1"
                              color={msg.deleted ? 'text.disabled' : 'text.primary'}
                              sx={{ 
                                fontStyle: msg.deleted ? 'italic' : 'normal',
                                position: 'relative',
                                '&:hover': {
                                  '& .edit-hint': {
                                    opacity: 1
                                  }
                                }
                              }}
                            >
                              {msg.deleted ? 'This message was deleted' : msg.content}
                              {msg.author._id === socket?.user?._id && !msg.deleted && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                  className="edit-hint"
                                  sx={{
                                    ml: 1,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleEditMessage(msg)}
                                >
                                  (click to edit)
                                </Typography>
                              )}
                            </Typography>
                            {msg.reactions && msg.reactions.length > 0 && (
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {msg.reactions.map((reaction, i) => {
                                  // Find the usernames for this reaction
                                  const usernames = users
                                    .filter(user => reaction.users.includes(user._id))
                                    .map(user => user.username)
                                    .join(', ');
                                  
                                  return (
                                    <Tooltip 
                                      key={i}
                                      title={usernames || 'No users'}
                                      arrow
                                      placement="top"
                                    >
                                      <Chip
                                        label={`${reaction.emoji} ${reaction.users.length}`}
                                        size="small"
                                        onClick={() => handleReaction(msg._id, reaction.emoji)}
                                        sx={{ cursor: 'pointer' }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <Box
                        className="message-actions"
                        sx={{
                          display: 'none',
                          position: 'absolute',
                          right: 16,
                          top: 8,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 2,
                        }}
                      >
                        <Tooltip title="Add Reaction">
                          <IconButton size="small" onClick={() => handleReaction(msg._id)}>
                            <EmojiIcon />
                          </IconButton>
                        </Tooltip>
                        {msg.author._id === socket?.user?._id && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditMessage(msg)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDeleteMessage(msg)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </Box>

            {/* Message Input */}
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                    disabled={!message.trim() || !currentChannel}
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

        {/* Users Sidebar */}
        {(showUserList || !isMobile) && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ height: '100%', overflow: 'auto' }}>
              <List>
                <ListItem>
                  <Typography variant="h6">Online Users</Typography>
                  {isMobile && (
                    <IconButton
                      sx={{ ml: 'auto' }}
                      onClick={() => setShowUserList(false)}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </ListItem>
                <Divider />
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
                            src={user.avatar}
                            onClick={() => handleProfileClick(user._id)}
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
          </Grid>
        )}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleDeleteMessage(selectedMessage)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Message</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Community; 