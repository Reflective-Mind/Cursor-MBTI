import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    mbtiType: ''
  });
  const [error, setError] = useState(null);

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
      const apiUrl = `${process.env.REACT_APP_API_URL}${endpoint}`;
      
      console.log('Sending auth request:', {
        url: apiUrl,
        method: 'POST',
        formData: {
          ...formData,
          password: '[REDACTED]'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server response was not JSON');
      }

      console.log('Auth API response:', {
        status: response.status,
        ok: response.ok,
        contentType,
        data: data.token ? { ...data, token: '[REDACTED]' } : data,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(data.message || data.details || `Authentication failed with status ${response.status}`);
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('mbtiType', formData.mbtiType || data.user?.mbtiType);
      navigate('/community');
    } catch (error) {
      console.error('Auth error:', {
        message: error.message,
        formData: {
          ...formData,
          password: '[REDACTED]'
        },
        endpoint: tab === 0 ? 'login' : 'register',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          REACT_APP_API_URL: process.env.REACT_APP_API_URL
        }
      });
      setError(error.message || 'Authentication failed. Please try again.');
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