import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    mbtiType: ''
  });
  const [error, setError] = useState(null);

  // Get the return URL from location state or default to '/community'
  const from = location.state?.from?.pathname || '/community';

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const endpoint = tab === 0 ? '/api/auth/login' : '/api/auth/register';
      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const apiUrl = `${baseUrl}${endpoint}`;
      
      console.log('Test 8 - Sending auth request:', {
        url: apiUrl,
        method: 'POST',
        formData: {
          ...formData,
          password: '[REDACTED]'
        },
        returnUrl: from
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Authentication failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token received from server');
      }

      // Login and store user data
      login(data.user, data.token);
      localStorage.setItem('mbtiType', formData.mbtiType || data.user?.mbtiType);
      
      console.log('Test 8 - Login successful, navigating to:', from);
      
      // Navigate to the return URL
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Test 8 - Auth error:', {
        message: error.message,
        returnUrl: from
      });

      let errorMessage = error.message;
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Connection error. Please try again later.';
      }

      setError(errorMessage || 'Authentication failed. Please try again.');
    }
  };

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {tab === 0 ? 'Login' : 'Register'}
          </Typography>
          
          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tab === 1 && (
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              )}
              
              <TextField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {tab === 1 && (
                <TextField
                  select
                  label="MBTI Type"
                  name="mbtiType"
                  value={formData.mbtiType}
                  onChange={handleChange}
                  required
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select your type</option>
                  {mbtiTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </TextField>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                {tab === 0 ? 'Login' : 'Register'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 