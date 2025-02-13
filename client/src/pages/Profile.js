import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedData, setEditedData] = useState({
    username: '',
    bio: '',
    mbtiType: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (userId) {
        // Fetch other user's profile
        response = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsOwnProfile(false);
      } else {
        // Fetch own profile
        response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsOwnProfile(true);
      }
      
      setUser(response.data.user);
      setEditedData({
        username: response.data.user.username,
        bio: response.data.user.bio || '',
        mbtiType: response.data.user.mbtiType || '',
      });
      setLoading(false);
    } catch (err) {
      setError(userId ? 'Failed to load user profile' : 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (jpg, jpeg, png, gif)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData({
        username: user.username,
        bio: user.bio || '',
        mbtiType: user.mbtiType || '',
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // If there's a file to upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        await axios.post('/api/auth/avatar', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Update other profile data
      const response = await axios.patch('/api/auth/me', editedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      setIsEditing(false);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Please log in to view your profile'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={previewUrl || user?.avatar}
                  sx={{ width: 200, height: 200, mb: 2 }}
                />
                {isOwnProfile && isEditing && (
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      right: 0,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleFileSelect}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>

            {/* Profile Info Section */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                  {user?.username}
                </Typography>
                {isOwnProfile && (
                  <Button
                    startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                    onClick={handleEditToggle}
                    color={isEditing ? 'error' : 'primary'}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                {isOwnProfile && isEditing ? (
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={editedData.username}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <Chip
                    label={`MBTI Type: ${user?.mbtiType || 'Not set'}`}
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                )}

                {isOwnProfile && isEditing ? (
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={editedData.bio}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                  />
                ) : (
                  <Typography variant="body1">
                    {user?.bio || 'No bio yet'}
                  </Typography>
                )}
              </Box>

              {isOwnProfile && isEditing && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 