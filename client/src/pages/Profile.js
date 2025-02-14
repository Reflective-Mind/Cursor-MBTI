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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Edit as EditIcon } from '@mui/icons-material';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    mbtiType: '',
    bio: ''
  });
  const navigate = useNavigate();

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { 
            state: { from: `/profile/${userId || ''}` },
            replace: true 
          });
          return;
        }

        // Determine which profile to fetch
        const targetUserId = userId || currentUser?._id;
        
        if (!targetUserId) {
          setError('No user ID available. Please log in or provide a user ID.');
          return;
        }

        console.log('Test 6 - Fetching profile:', {
          targetUserId,
          currentUser: currentUser?._id,
          token: token ? 'Present' : 'Missing'
        });

        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
        const response = await fetch(`${baseUrl}/api/users/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        console.log('Test 6 - Profile API response:', {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login', { 
              state: { from: `/profile/${userId || ''}` },
              replace: true 
            });
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load profile');
        }

        const data = await response.json();
        console.log('Test 6 - Profile data:', {
          username: data.username,
          mbtiType: data.mbtiType,
          isCurrentUser: data._id === currentUser?._id
        });

        setUser(data);
        setEditForm({
          username: data.username || '',
          mbtiType: data.mbtiType || '',
          bio: data.bio || ''
        });
      } catch (err) {
        console.error('Test 6 - Profile loading error:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, navigate]);

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Test 6 - Updating profile:', {
        userId: user._id,
        updates: { ...editForm, password: '[REDACTED]' }
      });

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(`${baseUrl}/api/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      console.log('Test 6 - Update profile response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);

      // Update local storage if it's the current user
      if (user._id === currentUser?._id) {
        localStorage.setItem('mbtiType', updatedUser.mbtiType);
      }
    } catch (err) {
      console.error('Test 6 - Profile update error:', {
        message: err.message,
        stack: err.stack
      });
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="info">Profile not found</Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

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
            {isOwnProfile && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            )}
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

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                fullWidth
              />
              <TextField
                select
                label="MBTI Type"
                value={editForm.mbtiType}
                onChange={(e) => setEditForm(prev => ({ ...prev, mbtiType: e.target.value }))}
                fullWidth
                SelectProps={{
                  native: true
                }}
              >
                <option value="">Select type</option>
                {mbtiTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </TextField>
              <TextField
                label="Bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
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