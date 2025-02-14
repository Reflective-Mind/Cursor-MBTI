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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentValue, setNewContentValue] = useState('');
  const [sectionMenuAnchor, setSectionMenuAnchor] = useState(null);
  const [contentMenuAnchor, setContentMenuAnchor] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

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
          navigate('/login');
          return;
        }

        const targetUserId = userId || currentUser?._id;
        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
        const endpoint = targetUserId ? `/api/users/${targetUserId}` : '/api/users/me';
        
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        setUser(data);
        initializeEditForm(data);
      } catch (err) {
        console.error('Profile loading error:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, navigate]);

  const initializeEditForm = (userData) => {
    setEditForm({
      username: userData.username || '',
      mbtiType: userData.mbtiType || '',
      bio: userData.bio || '',
      personalityTraits: userData.personalityTraits || [],
      interests: userData.interests || [],
      favoriteQuote: userData.favoriteQuote || { text: '', author: '' },
      socialLinks: userData.socialLinks || {
        twitter: '',
        linkedin: '',
        github: '',
        website: ''
      },
      location: userData.location || { city: '', country: '' },
      occupation: userData.occupation || '',
      education: userData.education || '',
      languages: userData.languages || [],
      achievements: userData.achievements || []
    });
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const targetUserId = userId || currentUser?._id;
      if (!targetUserId) {
        throw new Error('No user ID available for update');
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(`${baseUrl}/api/users/${targetUserId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);

      if (targetUserId === currentUser?._id) {
        localStorage.setItem('mbtiType', updatedUser.mbtiType);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
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

  const handleAddSection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(`${baseUrl}/api/users/${user._id}/sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newSectionTitle || 'New Section' })
      });

      if (!response.ok) throw new Error('Failed to add section');
      
      const newSection = await response.json();
      setSections([...sections, newSection]);
      setNewSectionTitle('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateSection = async (sectionId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(`${baseUrl}/api/users/${user._id}/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update section');
      
      const updatedSections = await response.json();
      setSections(updatedSections);
      setEditingSection(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(`${baseUrl}/api/users/${user._id}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete section');
      
      setSections(sections.filter(s => s.id !== sectionId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddContent = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(`${baseUrl}/api/users/${user._id}/sections/${sectionId}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newContentTitle || 'New Item',
          value: newContentValue
        })
      });

      if (!response.ok) throw new Error('Failed to add content');
      
      const newContent = await response.json();
      setSections(sections.map(section => 
        section.id === sectionId
          ? { ...section, content: [...section.content, newContent] }
          : section
      ));
      setNewContentTitle('');
      setNewContentValue('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateContent = async (sectionId, contentId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(
        `${baseUrl}/api/users/${user._id}/sections/${sectionId}/content/${contentId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) throw new Error('Failed to update content');
      
      const updatedContent = await response.json();
      setSections(sections.map(section => 
        section.id === sectionId
          ? {
              ...section,
              content: section.content.map(c => 
                c.id === contentId ? updatedContent : c
              )
            }
          : section
      ));
      setEditingContent(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteContent = async (sectionId, contentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || '';
      const response = await fetch(
        `${baseUrl}/api/users/${user._id}/sections/${sectionId}/content/${contentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete content');
      
      setSections(sections.map(section => 
        section.id === sectionId
          ? {
              ...section,
              content: section.content.filter(c => c.id !== contentId)
            }
          : section
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      const reorderedSections = Array.from(sections);
      const [removed] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, removed);

      // Update order for all affected sections
      const updates = reorderedSections.map((section, index) => 
        handleUpdateSection(section.id, { order: index })
      );
      
      await Promise.all(updates);
      setSections(reorderedSections);
    } else if (type === 'content') {
      const sourceSection = sections.find(s => s.id === source.droppableId);
      const destSection = sections.find(s => s.id === destination.droppableId);

      if (sourceSection && destSection) {
        const newSections = [...sections];
        const sourceContent = [...sourceSection.content];
        const destContent = source.droppableId === destination.droppableId
          ? sourceContent
          : [...destSection.content];

        const [removed] = sourceContent.splice(source.index, 1);
        destContent.splice(destination.index, 0, removed);

        // Update the sections
        if (source.droppableId === destination.droppableId) {
          // Same section, just reorder
          const updates = destContent.map((content, index) =>
            handleUpdateContent(destSection.id, content.id, { order: index })
          );
          await Promise.all(updates);
        } else {
          // Different sections
          const sourceUpdates = sourceContent.map((content, index) =>
            handleUpdateContent(sourceSection.id, content.id, { order: index })
          );
          const destUpdates = destContent.map((content, index) =>
            handleUpdateContent(destSection.id, content.id, { order: index })
          );
          await Promise.all([...sourceUpdates, ...destUpdates]);
        }

        setSections(newSections.map(section => {
          if (section.id === source.droppableId) {
            return { ...section, content: sourceContent };
          }
          if (section.id === destination.droppableId) {
            return { ...section, content: destContent };
          }
          return section;
        }));
      }
    }
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

      {isOwnProfile && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEditingSection('new')}
          >
            Add Section
          </Button>
        </Box>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                  isDragDisabled={!isOwnProfile}
                >
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      elevation={3}
                      sx={{ mb: 2, overflow: 'hidden' }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          borderBottom: 1,
                          borderColor: 'divider',
                          bgcolor: 'background.default'
                        }}
                      >
                        {isOwnProfile && (
                          <div {...provided.dragHandleProps}>
                            <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          </div>
                        )}
                        
                        {editingSection === section.id ? (
                          <TextField
                            value={section.title}
                            onChange={(e) => setSections(sections.map(s =>
                              s.id === section.id ? { ...s, title: e.target.value } : s
                            ))}
                            size="small"
                            fullWidth
                            sx={{ mr: 1 }}
                          />
                        ) : (
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {section.title}
                          </Typography>
                        )}

                        {isOwnProfile && (
                          <Box>
                            {editingSection === section.id ? (
                              <>
                                <IconButton
                                  onClick={() => handleUpdateSection(section.id, {
                                    title: section.title
                                  })}
                                  color="primary"
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => setEditingSection(null)}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  onClick={() => setEditingSection(section.id)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  onClick={(e) => {
                                    setSectionMenuAnchor(e.currentTarget);
                                    setSelectedSection(section);
                                  }}
                                >
                                  <MoreIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        )}
                      </Box>

                      <Droppable
                        droppableId={section.id}
                        type="content"
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ p: 2 }}
                          >
                            {section.content.map((content, index) => (
                              <Draggable
                                key={content.id}
                                draggableId={content.id}
                                index={index}
                                isDragDisabled={!isOwnProfile}
                              >
                                {(provided) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{ mb: 2 }}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {isOwnProfile && (
                                          <div {...provided.dragHandleProps}>
                                            <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                          </div>
                                        )}
                                        
                                        {editingContent === content.id ? (
                                          <Box sx={{ flexGrow: 1 }}>
                                            <TextField
                                              value={content.title}
                                              onChange={(e) => setSections(sections.map(s =>
                                                s.id === section.id ? {
                                                  ...s,
                                                  content: s.content.map(c =>
                                                    c.id === content.id
                                                      ? { ...c, title: e.target.value }
                                                      : c
                                                  )
                                                } : s
                                              ))}
                                              size="small"
                                              fullWidth
                                              sx={{ mb: 1 }}
                                            />
                                            <TextField
                                              value={content.value || ''}
                                              onChange={(e) => setSections(sections.map(s =>
                                                s.id === section.id ? {
                                                  ...s,
                                                  content: s.content.map(c =>
                                                    c.id === content.id
                                                      ? { ...c, value: e.target.value }
                                                      : c
                                                  )
                                                } : s
                                              ))}
                                              size="small"
                                              fullWidth
                                              multiline
                                            />
                                          </Box>
                                        ) : (
                                          <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1">
                                              {content.title}
                                            </Typography>
                                            {content.value && (
                                              <Typography variant="body1" color="text.secondary">
                                                {content.value}
                                              </Typography>
                                            )}
                                          </Box>
                                        )}

                                        {isOwnProfile && (
                                          <Box>
                                            {editingContent === content.id ? (
                                              <>
                                                <IconButton
                                                  onClick={() => handleUpdateContent(
                                                    section.id,
                                                    content.id,
                                                    {
                                                      title: content.title,
                                                      value: content.value
                                                    }
                                                  )}
                                                  color="primary"
                                                >
                                                  <SaveIcon />
                                                </IconButton>
                                                <IconButton
                                                  onClick={() => setEditingContent(null)}
                                                >
                                                  <CancelIcon />
                                                </IconButton>
                                              </>
                                            ) : (
                                              <>
                                                <IconButton
                                                  onClick={() => setEditingContent(content.id)}
                                                >
                                                  <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                  onClick={(e) => {
                                                    setContentMenuAnchor(e.currentTarget);
                                                    setSelectedContent(content);
                                                    setSelectedSection(section);
                                                  }}
                                                >
                                                  <MoreIcon />
                                                </IconButton>
                                              </>
                                            )}
                                          </Box>
                                        )}
                                      </Box>
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {isOwnProfile && (
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => handleAddContent(section.id)}
                                fullWidth
                                sx={{ mt: 1 }}
                              >
                                Add Item
                              </Button>
                            )}
                          </Box>
                        )}
                      </Droppable>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Section Menu */}
      <Menu
        anchorEl={sectionMenuAnchor}
        open={Boolean(sectionMenuAnchor)}
        onClose={() => setSectionMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setSectionMenuAnchor(null);
            if (selectedSection) {
              handleDeleteSection(selectedSection.id);
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Section</ListItemText>
        </MenuItem>
      </Menu>

      {/* Content Menu */}
      <Menu
        anchorEl={contentMenuAnchor}
        open={Boolean(contentMenuAnchor)}
        onClose={() => setContentMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setContentMenuAnchor(null);
            if (selectedSection && selectedContent) {
              handleDeleteContent(selectedSection.id, selectedContent.id);
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Item</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Section Dialog */}
      <Dialog
        open={editingSection === 'new'}
        onClose={() => setEditingSection(null)}
      >
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Section Title"
            fullWidth
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingSection(null)}>Cancel</Button>
          <Button onClick={handleAddSection} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 