import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
        const response = await fetch(`${baseUrl}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to load user profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">User not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={profile.avatar}
              sx={{
                width: 150,
                height: 150,
                margin: '0 auto',
                mb: 2,
                border: 3,
                borderColor: profile.isOnline ? 'success.main' : 'grey.300'
              }}
            >
              {profile.username?.[0]}
            </Avatar>
            <Chip
              label={profile.isOnline ? 'Online' : 'Offline'}
              color={profile.isOnline ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {profile.username}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              MBTI Type: {profile.mbtiType}
            </Typography>
            {profile.bio && (
              <Typography variant="body1" paragraph>
                {profile.bio}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Personality Traits
          </Typography>
          <Grid container spacing={2}>
            {profile.mbtiType?.split('').map((trait, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" align="center">
                      {trait}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {getTraitDescription(trait)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

const getTraitDescription = (trait) => {
  const traits = {
    'I': 'Introversion',
    'E': 'Extroversion',
    'N': 'Intuition',
    'S': 'Sensing',
    'T': 'Thinking',
    'F': 'Feeling',
    'J': 'Judging',
    'P': 'Perceiving'
  };
  return traits[trait] || trait;
};

export default Profile; 