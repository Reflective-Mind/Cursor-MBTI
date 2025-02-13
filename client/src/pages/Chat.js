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
} from '@mui/material';
import { Send as SendIcon, Person as PersonIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I am your MBTI personality assistant. I can help you understand your personality type better and provide personalized advice. What would you like to know?'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [mbtiType, setMbtiType] = useState(null);

  useEffect(() => {
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
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

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

      console.log('Test 2 - Sending chat request:', {
        url: `${process.env.REACT_APP_API_URL}/api/chat/message`,
        messages: messages.length,
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        systemMessage: 'Present'
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat/message`, {
        messages: [
          systemMessage,
          ...messages.filter(msg => msg.role !== 'error'),
          userMessage
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        withCredentials: true,
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      console.log('Test 2 - Chat API response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data ? {
          choices: response.data.choices?.length,
          message: response.data.choices?.[0]?.message ? 'Present' : 'Missing'
        } : 'Missing'
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Test 2 - ' + (response.data?.error?.message || response.data?.message || 'Chat API error'));
      }

      if (!response.data.choices?.[0]?.message) {
        throw new Error('Test 2 - Invalid response format from API');
      }

      const assistantMessage = response.data.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Test 2 - Chat API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      setError('Test 2 - Sorry, I encountered an error. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Test 2 - I apologize, but I encountered an error. Please try again.',
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
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Chat with AI Assistant
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Ask questions about your personality type and get personalized advice
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
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
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <PsychologyIcon />}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                  }}
                >
                  <Typography
                    sx={{
                      color: message.role === 'user' ? 'common.white' : 'text.primary',
                      whiteSpace: 'pre-wrap',
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

          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
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
                size="small"
                disabled={isLoading}
              />
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
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Chat; 