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
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editForm, setEditForm] = useState({
    username: '',
    mbtiType: '',
    bio: '',
    location: '',
    occupation: '',
    education: '',
    languages: [],
    interests: [],
    achievements: []
  });
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentValue, setNewContentValue] = useState('');
  const [sectionMenuAnchor, setSectionMenuAnchor] = useState(null);
  const [contentMenuAnchorEl, setContentMenuAnchorEl] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  useEffect(() => {
    if (!currentUser && !loading) {
      navigate('/login', { state: { from: location } });
      return;
    }
    fetchProfile();
  }, [userId, currentUser, loading]);

  const fetchProfile = async () => {
    try {
      const targetId = userId || currentUser?._id;
      if (!targetId) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: location } });
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('mbtiType');
        navigate('/login', { state: { from: location } });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setEditForm({
        username: data.username || '',
        mbtiType: data.mbtiType || '',
        bio: data.bio || '',
        location: data.location || '',
        occupation: data.occupation || '',
        education: data.education || '',
        languages: data.languages || [],
        interests: data.interests || [],
        achievements: data.achievements || []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: profile.username || '',
      mbtiType: profile.mbtiType || '',
      bio: profile.bio || '',
      location: profile.location || '',
      occupation: profile.occupation || '',
      education: profile.education || '',
      languages: profile.languages || [],
      interests: profile.interests || [],
      achievements: profile.achievements || []
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${currentUser._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleAddAchievement = () => {
    setEditForm(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', description: '' }]
    }));
  };

  const handleRemoveAchievement = (index) => {
    setEditForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
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
      const response = await fetch(`${baseUrl}/api/users/${profile._id}/sections`, {
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
      const response = await fetch(`${baseUrl}/api/users/${profile._id}/sections/${sectionId}`, {
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
      const response = await fetch(`${baseUrl}/api/users/${profile._id}/sections/${sectionId}`, {
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
      const response = await fetch(`${baseUrl}/api/users/${profile._id}/sections/${sectionId}/content`, {
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
        `${baseUrl}/api/users/${profile._id}/sections/${sectionId}/content/${contentId}`,
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
        `${baseUrl}/api/users/${profile._id}/sections/${sectionId}/content/${contentId}`,
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{ width: 100, height: 100, fontSize: '2.5rem' }}
            >
              {profile?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              {isEditing ? (
                <TextField
                  name="username"
                  value={editForm.username}
                  onChange={handleChange}
                  variant="standard"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h4">{profile?.username}</Typography>
              )}
              {isEditing ? (
                <TextField
                  name="mbtiType"
                  value={editForm.mbtiType}
                  onChange={handleChange}
                  variant="standard"
                  size="small"
                />
              ) : (
                <Chip label={profile?.mbtiType} color="primary" />
              )}
            </Box>
          </Box>
          {isOwnProfile && (
            <Box>
              {isEditing ? (
                <>
                  <IconButton onClick={handleSave} color="primary">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleCancel} color="error">
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={handleEdit} color="primary">
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Bio Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>About Me</Typography>
          {isEditing ? (
            <TextField
              name="bio"
              value={editForm.bio}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          ) : (
            <Typography>{profile?.bio || 'No bio available'}</Typography>
          )}
        </Box>

        {/* Info Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="action" />
              {isEditing ? (
                <TextField
                  name="location"
                  value={editForm.location}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  placeholder="Location"
                />
              ) : (
                <Typography>{profile?.location || 'Location not specified'}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon color="action" />
              {isEditing ? (
                <TextField
                  name="occupation"
                  value={editForm.occupation}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  placeholder="Occupation"
                />
              ) : (
                <Typography>{profile?.occupation || 'Occupation not specified'}</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="action" />
              {isEditing ? (
                <TextField
                  name="education"
                  value={editForm.education}
                  onChange={handleChange}
                  variant="standard"
                  fullWidth
                  placeholder="Education"
                />
              ) : (
                <Typography>{profile?.education || 'Education not specified'}</Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Languages Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Languages</Typography>
            {isEditing && (
              <IconButton onClick={handleAddLanguage} color="primary" size="small">
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Grid container spacing={2}>
            {(isEditing ? editForm.languages : profile?.languages || []).map((language, index) => (
              <Grid item key={index}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={language.name}
                      onChange={(e) => {
                        const newLanguages = [...editForm.languages];
                        newLanguages[index] = { ...newLanguages[index], name: e.target.value };
                        setEditForm(prev => ({ ...prev, languages: newLanguages }));
                      }}
                      variant="standard"
                      size="small"
                      placeholder="Language"
                    />
                    <IconButton onClick={() => handleRemoveLanguage(index)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Chip
                    icon={<LanguageIcon />}
                    label={language.name}
                    variant="outlined"
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Interests Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Interests</Typography>
            {isEditing && (
              <IconButton onClick={handleAddInterest} color="primary" size="small">
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Grid container spacing={2}>
            {(isEditing ? editForm.interests : profile?.interests || []).map((interest, index) => (
              <Grid item key={index}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={interest}
                      onChange={(e) => {
                        const newInterests = [...editForm.interests];
                        newInterests[index] = e.target.value;
                        setEditForm(prev => ({ ...prev, interests: newInterests }));
                      }}
                      variant="standard"
                      size="small"
                      placeholder="Interest"
                    />
                    <IconButton onClick={() => handleRemoveInterest(index)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Chip label={interest} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Achievements Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Achievements</Typography>
            {isEditing && (
              <IconButton onClick={handleAddAchievement} color="primary" size="small">
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Grid container spacing={2}>
            {(isEditing ? editForm.achievements : profile?.achievements || []).map((achievement, index) => (
              <Grid item xs={12} key={index}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        value={achievement.title}
                        onChange={(e) => {
                          const newAchievements = [...editForm.achievements];
                          newAchievements[index] = { ...newAchievements[index], title: e.target.value };
                          setEditForm(prev => ({ ...prev, achievements: newAchievements }));
                        }}
                        variant="standard"
                        size="small"
                        fullWidth
                        placeholder="Achievement Title"
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        value={achievement.description}
                        onChange={(e) => {
                          const newAchievements = [...editForm.achievements];
                          newAchievements[index] = { ...newAchievements[index], description: e.target.value };
                          setEditForm(prev => ({ ...prev, achievements: newAchievements }));
                        }}
                        variant="standard"
                        size="small"
                        fullWidth
                        multiline
                        placeholder="Achievement Description"
                      />
                    </Box>
                    <IconButton onClick={() => handleRemoveAchievement(index)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>{achievement.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Paper>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 