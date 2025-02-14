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
  Collapse,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreVert as MoreIcon,
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
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userId } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    mbtiType: '',
    sections: []
  });
  const [expandedSection, setExpandedSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionDialog, setNewSectionDialog] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    type: 'container',
    content: []
  });
  const [contentDialog, setContentDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newContent, setNewContent] = useState({
    type: 'text',
    title: '',
    content: '',
    url: ''
  });

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  // Move fetchProfile outside useEffect
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      const endpoint = !userId ? 'me' : userId;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.status === 401) {
        localStorage.removeItem('token');
        setError('Authentication required');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      // Initialize sections as an empty array if it doesn't exist
      data.sections = data.sections || [];
      data.profileSections = data.profileSections || [];
      
      setProfile(data);
      setEditForm({
        username: data.username || '',
        mbtiType: data.mbtiType || '',
        sections: data.sections || []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data
  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [userId, authLoading]);

  const handleSectionExpand = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleAddSection = () => {
    // Check section limit before opening dialog
    if (profile?.sections?.length >= 10) {
      setError('Cannot add more than 10 sections');
      return;
    }
    setNewSection({
      title: '',
      type: 'container',
      content: []
    });
    setNewSectionDialog(true);
  };

  const handleSaveNewSection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!newSection.title.trim()) {
        setError('Section title is required');
        return;
      }

      // Use profile._id for API calls
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newSection.title,
          type: 'custom'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add section');
      }
      
      const newSectionData = await response.json();
      
      // Update the profile state with the new section
      setProfile(prev => ({
        ...prev,
        sections: [...(prev.sections || []), newSectionData]
      }));
      
      setNewSectionDialog(false);
      setNewSection({ title: '', type: 'custom', content: [] });
      setError(null);

      // Refresh profile data to ensure we have the latest state
      fetchProfile();
    } catch (error) {
      console.error('Error adding section:', error);
      setError(error.message);
    }
  };

  const handleEditSection = (sectionId) => {
    setEditingSection(sectionId);
  };

  const handleUpdateSection = async (sectionId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update section');
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditingSection(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSection = async (sectionId, event) => {
    try {
      event.stopPropagation(); // Prevent accordion from toggling
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete section');
      }

      // Remove the section from the profile state
      setProfile(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== sectionId)
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error deleting section:', error);
      setError(error.message);
    }
  };

  const handleAddContent = (sectionId) => {
    setSelectedSection(sectionId);
    setNewContent({
      type: 'text',
      content: ''
    });
    setContentDialog(true);
  };

  const handleSaveContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!newContent.content.trim()) {
        setError('Content is required');
        return;
      }

      // Use profile._id for API calls
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections/${selectedSection}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'text',
          content: newContent.content
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add content');
      }
      
      const newContentData = await response.json();
      
      // Update the profile state with the new content
      setProfile(prev => ({
        ...prev,
        sections: prev.sections.map(section => 
          section.id === selectedSection
            ? { ...section, content: [...section.content, newContentData] }
            : section
        )
      }));
      
      setContentDialog(false);
      setNewContent({ type: 'text', content: '' });
      setSelectedSection(null);
      setError(null);

      // Refresh profile data to ensure we have the latest state
      fetchProfile();
    } catch (error) {
      console.error('Error adding content:', error);
      setError(error.message);
    }
  };

  const handleDeleteContent = async (sectionId, contentId, event) => {
    try {
      event.stopPropagation(); // Prevent accordion from toggling
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections/${sectionId}/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete content');
      }

      // Remove the content from the profile state
      setProfile(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? { ...section, content: section.content.filter(item => item.id !== contentId) }
            : section
        )
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      setError(error.message);
    }
  };

  const renderContent = (content) => {
    switch (content.type) {
      case 'text':
        return (
          <Typography variant="body1">{content.content}</Typography>
        );
      case 'link':
        return (
          <Button
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<WebsiteIcon />}
          >
            {content.title}
          </Button>
        );
      case 'achievement':
        return (
          <Box>
            <Typography variant="subtitle1">{content.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {content.content}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  if (authLoading || loading) {
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

  if (!profile) return null;

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
              <Typography variant="h4">{profile?.username}</Typography>
              <Chip label={profile?.mbtiType} color="primary" />
            </Box>
          </Box>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSection}
              disabled={profile?.sections?.length >= 10}
              title={profile?.sections?.length >= 10 ? 'Maximum number of sections reached' : 'Add new section'}
            >
              Add Section
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {profile?.sections?.map((section) => (
            <Paper
              key={section.id}
              elevation={2}
              sx={{ 
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {section.title}
                </Typography>
                {isOwnProfile && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddContent(section.id)}
                      size="small"
                      variant="outlined"
                    >
                      Add Text
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteSection(section.id, e)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              {/* Section Content */}
              <Box sx={{ pl: 2 }}>
                {section.content?.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <Typography variant="body1">
                      {item.content}
                    </Typography>
                    {isOwnProfile && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteContent(section.id, item.id, e)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Add Section Dialog */}
        <Dialog open={newSectionDialog} onClose={() => setNewSectionDialog(false)}>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Section Title"
              fullWidth
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              error={!!error && error.includes('title')}
              helperText={error && error.includes('title') ? error : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setNewSectionDialog(false);
              setError(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewSection} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Content Dialog */}
        <Dialog open={contentDialog} onClose={() => setContentDialog(false)}>
          <DialogTitle>Add Text</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={newContent.content}
              onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              error={!!error && error.includes('content')}
              helperText={error && error.includes('content') ? error : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setContentDialog(false);
              setError(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Profile; 