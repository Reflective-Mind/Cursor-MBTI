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
  const { login, register } = useAuth();
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    mbtiType: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      if (tab === 0) {
        // Login
        await login(formData.email, formData.password);
      } else {
        // Register
        await register(formData.username, formData.email, formData.password, formData.mbtiType);
      }
      
      console.log('Authentication successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                  disabled={isSubmitting}
                />
              )}
              
              <TextField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />

              {tab === 1 && (
                <TextField
                  select
                  label="MBTI Type"
                  name="mbtiType"
                  value={formData.mbtiType}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Please wait...' : (tab === 0 ? 'Login' : 'Register')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 