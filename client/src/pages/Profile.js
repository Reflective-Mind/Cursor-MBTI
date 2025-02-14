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
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  EmojiEvents as AchievementIcon,
  FormatQuote as QuoteIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// TabPanel component for profile sections
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editForm, setEditForm] = useState({
    username: '',
    mbtiType: '',
    bio: '',
    personalityTraits: [],
    interests: [],
    favoriteQuote: { text: '', author: '' },
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: '',
      website: ''
    },
    location: {
      city: '',
      country: ''
    },
    occupation: '',
    education: '',
    languages: [],
    achievements: []
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

        // If no userId is provided in URL and we have currentUser, use currentUser's ID
        const targetUserId = userId || currentUser?._id;
        
        // If we still don't have a targetUserId, try to fetch current user's profile
        if (!targetUserId) {
          console.log('Test 8 - No target user ID, fetching current user profile');
          const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
          const response = await fetch(`${baseUrl}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('token');
              navigate('/login');
              return;
            }
            throw new Error('Failed to fetch current user profile');
          }

          const data = await response.json();
          setUser(data);
          setEditForm({
            username: data.username || '',
            mbtiType: data.mbtiType || '',
            bio: data.bio || '',
            personalityTraits: data.personalityTraits || [],
            interests: data.interests || [],
            favoriteQuote: data.favoriteQuote || { text: '', author: '' },
            socialLinks: data.socialLinks || {
              twitter: '',
              linkedin: '',
              github: '',
              website: ''
            },
            location: data.location || { city: '', country: '' },
            occupation: data.occupation || '',
            education: data.education || '',
            languages: data.languages || [],
            achievements: data.achievements || []
          });
          setLoading(false);
          return;
        }

        console.log('Test 8 - Fetching profile:', {
          targetUserId,
          currentUser: currentUser?._id,
          isOwnProfile: targetUserId === currentUser?._id
        });

        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
        const response = await fetch(`${baseUrl}/api/users/${targetUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        console.log('Test 8 - Profile API response:', {
          status: response.status,
          ok: response.ok
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
        console.log('Test 8 - Profile data:', {
          username: data.username,
          mbtiType: data.mbtiType,
          isCurrentUser: data._id === currentUser?._id
        });

        setUser(data);
        setEditForm({
          username: data.username || '',
          mbtiType: data.mbtiType || '',
          bio: data.bio || '',
          personalityTraits: data.personalityTraits || [],
          interests: data.interests || [],
          favoriteQuote: data.favoriteQuote || { text: '', author: '' },
          socialLinks: data.socialLinks || {
            twitter: '',
            linkedin: '',
            github: '',
            website: ''
          },
          location: data.location || { city: '', country: '' },
          occupation: data.occupation || '',
          education: data.education || '',
          languages: data.languages || [],
          achievements: data.achievements || []
        });
      } catch (err) {
        console.error('Test 8 - Profile loading error:', {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddLanguage = () => {
    setEditForm(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', proficiency: 'beginner' }]
    }));
  };

  const handleRemoveLanguage = (index) => {
    setEditForm(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleAddAchievement = () => {
    setEditForm(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', description: '', date: new Date() }]
    }));
  };

  const handleRemoveAchievement = (index) => {
    setEditForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleAddInterest = () => {
    setEditForm(prev => ({
      ...prev,
      interests: [...prev.interests, '']
    }));
  };

  const handleRemoveInterest = (index) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Profile not found</Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: theme.shape.borderRadius,
          overflow: 'hidden',
          background: `linear-gradient(to bottom, ${user.theme?.primaryColor || theme.palette.primary.main}22, transparent)`
        }}
      >
        {/* Header Section */}
        <Box 
          sx={{ 
            p: isMobile ? 2 : 4,
            background: `linear-gradient(to right, ${user.theme?.primaryColor || theme.palette.primary.main}11, ${user.theme?.accentColor || theme.palette.secondary.main}11)`,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={user.avatar}
                sx={{
                  width: isMobile ? 120 : 200,
                  height: isMobile ? 120 : 200,
                  margin: '0 auto',
                  mb: 2,
                  border: 4,
                  borderColor: user.isOnline ? 'success.main' : 'grey.300',
                  boxShadow: theme.shadows[8]
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
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom>
                {user.username}
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {user.mbtiType}
              </Typography>
              {user.bio && (
                <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                  {user.bio}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {user.location?.city && (
                  <Chip
                    icon={<LocationIcon />}
                    label={`${user.location.city}, ${user.location.country}`}
                    variant="outlined"
                  />
                )}
                {user.occupation && (
                  <Chip
                    icon={<WorkIcon />}
                    label={user.occupation}
                    variant="outlined"
                  />
                )}
                {user.education && (
                  <Chip
                    icon={<SchoolIcon />}
                    label={user.education}
                    variant="outlined"
                  />
                )}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {user.socialLinks?.twitter && (
                  <IconButton 
                    component={Link} 
                    href={user.socialLinks.twitter}
                    target="_blank"
                    color="primary"
                  >
                    <TwitterIcon />
                  </IconButton>
                )}
                {user.socialLinks?.linkedin && (
                  <IconButton 
                    component={Link} 
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    color="primary"
                  >
                    <LinkedInIcon />
                  </IconButton>
                )}
                {user.socialLinks?.github && (
                  <IconButton 
                    component={Link} 
                    href={user.socialLinks.github}
                    target="_blank"
                    color="primary"
                  >
                    <GitHubIcon />
                  </IconButton>
                )}
                {user.socialLinks?.website && (
                  <IconButton 
                    component={Link} 
                    href={user.socialLinks.website}
                    target="_blank"
                    color="primary"
                  >
                    <WebsiteIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab label="Personality" />
            <Tab label="Interests" />
            <Tab label="Languages" />
            <Tab label="Achievements" />
          </Tabs>
        </Box>

        {/* Personality Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personality Traits
                  </Typography>
                  {user.personalityTraits?.map((trait, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">{trait.trait}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trait.strength}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={trait.strength}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {user.favoriteQuote?.text && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Favorite Quote
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <QuoteIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="body1" paragraph>
                          "{user.favoriteQuote.text}"
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          — {user.favoriteQuote.author}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Interests Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user.interests?.map((interest, index) => (
              <Chip
                key={index}
                label={interest}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </TabPanel>

        {/* Languages Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={2}>
            {user.languages?.map((language, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {language.name}
                    </Typography>
                    <Chip
                      label={language.proficiency}
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Achievements Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={2}>
            {user.achievements?.map((achievement, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <AchievementIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {achievement.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {achievement.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(achievement.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={isEditing} 
        onClose={() => setIsEditing(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">Location</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={editForm.location.city}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  value={editForm.location.country}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    location: { ...prev.location, country: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">Professional Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Occupation"
                  value={editForm.occupation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Education"
                  value={editForm.education}
                  onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">Social Links</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Twitter"
                  value={editForm.socialLinks.twitter}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="LinkedIn"
                  value={editForm.socialLinks.linkedin}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="GitHub"
                  value={editForm.socialLinks.github}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, github: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Website"
                  value={editForm.socialLinks.website}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, website: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">
              Languages
              <IconButton size="small" onClick={handleAddLanguage} sx={{ ml: 1 }}>
                <AddIcon />
              </IconButton>
            </Typography>
            {editForm.languages.map((language, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Language"
                    value={language.name}
                    onChange={(e) => {
                      const newLanguages = [...editForm.languages];
                      newLanguages[index].name = e.target.value;
                      setEditForm(prev => ({ ...prev, languages: newLanguages }));
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    select
                    label="Proficiency"
                    value={language.proficiency}
                    onChange={(e) => {
                      const newLanguages = [...editForm.languages];
                      newLanguages[index].proficiency = e.target.value;
                      setEditForm(prev => ({ ...prev, languages: newLanguages }));
                    }}
                    fullWidth
                    SelectProps={{
                      native: true
                    }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="native">Native</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton onClick={() => handleRemoveLanguage(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Divider />

            <Typography variant="h6">
              Achievements
              <IconButton size="small" onClick={handleAddAchievement} sx={{ ml: 1 }}>
                <AddIcon />
              </IconButton>
            </Typography>
            {editForm.achievements.map((achievement, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Title"
                    value={achievement.title}
                    onChange={(e) => {
                      const newAchievements = [...editForm.achievements];
                      newAchievements[index].title = e.target.value;
                      setEditForm(prev => ({ ...prev, achievements: newAchievements }));
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Description"
                    value={achievement.description}
                    onChange={(e) => {
                      const newAchievements = [...editForm.achievements];
                      newAchievements[index].description = e.target.value;
                      setEditForm(prev => ({ ...prev, achievements: newAchievements }));
                    }}
                    fullWidth
                    multiline
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton onClick={() => handleRemoveAchievement(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Divider />

            <Typography variant="h6">Favorite Quote</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Quote"
                  value={editForm.favoriteQuote.text}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    favoriteQuote: { ...prev.favoriteQuote, text: e.target.value }
                  }))}
                  fullWidth
                  multiline
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Author"
                  value={editForm.favoriteQuote.author}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    favoriteQuote: { ...prev.favoriteQuote, author: e.target.value }
                  }))}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 