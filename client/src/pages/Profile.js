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
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the URL parameter id if available, otherwise use the logged-in user's id
        const userId = id || currentUser?._id;
        
        if (!userId) {
          throw new Error('No user ID available. Please log in or provide a user ID.');
        }

        console.log(`Fetching profile details for user ${userId}`);
        const token = localStorage.getItem('token');
        console.log('Token status:', token ? 'present' : 'missing');

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load profile');
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        setUser(data);
      } catch (err) {
        console.error('Profile loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div>No profile found</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={user.avatar}
              sx={{
                width: 150,
                height: 150,
                margin: '0 auto',
                mb: 2,
                border: 3,
                borderColor: user.isOnline ? 'success.main' : 'grey.300'
              }}
            >
              {user.username?.[0]}
            </Avatar>
            <Chip
              label={user.isOnline ? 'Online' : 'Offline'}
              color={user.isOnline ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {user.username}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              MBTI Type: {user.mbtiType}
            </Typography>
            {user.bio && (
              <Typography variant="body1" paragraph>
                {user.bio}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Personality Traits
          </Typography>
          <Grid container spacing={2}>
            {user.mbtiType?.split('').map((trait, index) => (
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