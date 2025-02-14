import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  ArrowUpward as ScrollTopIcon,
  Group as CommunityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I am your MBTI personality assistant. I can help you understand your personality type better and provide personalized advice. What would you like to know?'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const messagesEndRef = useRef(null);
  const [mbtiType, setMbtiType] = useState(null);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const storedType = localStorage.getItem('mbtiType');
    const storedDetails = localStorage.getItem('mbtiDetails');
    let detailedInfo = null;

    if (storedDetails) {
      try {
        detailedInfo = JSON.parse(storedDetails);
      } catch (error) {
        console.error('Error parsing MBTI details:', error);
      }
    }

    if (storedType) {
      setMbtiType(storedType);
      const welcomeMessage = {
        role: 'assistant',
        content: `Hello! I am your MBTI personality assistant. I see that you are an ${storedType} type. ${
          detailedInfo ? `Based on your assessment, you show strong ${detailedInfo.dominantTraits.attitude} (${Math.round(detailedInfo.percentages[storedType[0]])}%) and ${detailedInfo.dominantTraits.perception} (${Math.round(detailedInfo.percentages[storedType[1]])}%) preferences.` : ''
        } I can help you understand your personality type better and provide personalized advice. What would you like to know?`
      };
      setMessages([welcomeMessage]);
    }
  }, [navigate]);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop } = chatContainerRef.current;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to continue.');
      navigate('/login');
      return;
    }

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const storedDetails = localStorage.getItem('mbtiDetails');
      let detailedInfo = null;

      if (storedDetails) {
        try {
          detailedInfo = JSON.parse(storedDetails);
        } catch (error) {
          console.error('Error parsing MBTI details:', error);
        }
      }

      const systemMessage = {
        role: 'system',
        content: `You are an MBTI personality expert assistant. ${mbtiType ? `The user is type ${mbtiType}.` : ''} ${
          detailedInfo ? `
Detailed assessment results:
- Dominant traits: ${Object.entries(detailedInfo.dominantTraits).map(([key, value]) => `${key}: ${value}`).join(', ')}
- Trait strengths: ${Object.entries(detailedInfo.traitStrengths).map(([key, value]) => `${key}: ${Math.round(value * 100)}%`).join(', ')}
- Assessment answers: ${detailedInfo.answers.map(a => `[${a.category}] ${a.question} => ${a.selectedOption}`).join(' | ')}` : ''
        } Provide helpful, personalized advice and insights about MBTI personality types. Keep responses concise and focused on MBTI-related topics.`
      };

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const apiUrl = `${baseUrl}/api/chat/message`;

      console.log('Test 9 - Sending chat request:', {
        url: apiUrl,
        messages: messages.length,
        token: token ? 'Present' : 'Missing',
        systemMessage: 'Present',
        isMobile
      });

      const response = await axios.post(apiUrl, {
        messages: [
          systemMessage,
          ...messages.filter(msg => msg.role !== 'error'),
          userMessage
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 30000
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      const assistantMessage = response.data.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Test 9 - Chat API Error:', {
        message: error.message,
        response: error.response?.data,
        isMobile
      });

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      const errorMessage = error.response?.data?.details || error.message;
      setError(`Error: ${errorMessage}`);
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="md" sx={{ 
      height: isMobile ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)',
      pt: 2,
      pb: isMobile ? 0 : 2
    }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: isMobile ? 1 : 3
        }}>
          <Typography variant="h3" component="h1" sx={{
            fontSize: isMobile ? '1.75rem' : '3rem',
          }}>
            Chat with AI Assistant
          </Typography>
          {isMobile && (
            <Button
              component={Link}
              to="/community"
              variant="outlined"
              size="small"
              startIcon={<CommunityIcon />}
              sx={{ 
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
            >
              Join Community
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            mb: 0,
            borderRadius: isMobile ? 0 : theme.shape.borderRadius,
            overflow: 'hidden'
          }}
        >
          <Box
            ref={chatContainerRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: isMobile ? 1 : 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: isMobile ? 32 : 40,
                    height: isMobile ? 32 : 40
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <PsychologyIcon />}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    maxWidth: '75%',
                    bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                  }}
                >
                  <Typography
                    sx={{
                      color: message.role === 'user' ? 'common.white' : 'text.primary',
                      whiteSpace: 'pre-wrap',
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <PsychologyIcon />
                </Avatar>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ 
            p: isMobile ? 1 : 2, 
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: isMobile ? '20px' : theme.shape.borderRadius,
                  }
                }}
              />
              {isMobile ? (
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  sx={{ 
                    alignSelf: 'flex-end',
                    mb: '4px'
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  sx={{ minWidth: 100 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      Send
                      <SendIcon sx={{ ml: 1 }} />
                    </>
                  )}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {showScrollTop && (
          <Fab
            color="primary"
            size="small"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: isMobile ? theme.spacing(8) : theme.spacing(2),
              right: theme.spacing(2),
              display: showScrollTop ? 'flex' : 'none'
            }}
          >
            <ScrollTopIcon />
          </Fab>
        )}
      </Box>
    </Container>
  );
};

export default Chat; 