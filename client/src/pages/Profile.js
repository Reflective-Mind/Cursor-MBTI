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
  Psychology as PsychologyIcon,
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
    profileSections: []
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
  const [expandedContent, setExpandedContent] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

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
      // Initialize profileSections as an empty array if it doesn't exist
      data.profileSections = data.profileSections || [];
      
      setProfile(data);
      setEditForm({
        username: data.username || '',
        mbtiType: data.mbtiType || '',
        profileSections: data.profileSections || []
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
    if (profile?.profileSections?.length >= (profile?.sectionLimits?.maxMainSections || 10)) {
      setError('Cannot add more than 10 sections');
      return;
    }
    setNewSection({
      title: '',
      type: 'custom',
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
        profileSections: [...(prev.profileSections || []), newSectionData]
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
        profileSections: prev.profileSections.filter(section => section.id !== sectionId)
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

      if (!newContent.title.trim() || !newContent.content.trim()) {
        setError('Both title and content are required');
        return;
      }

      console.log('Sending content:', {
        title: newContent.title,
        content: newContent.content,
        section: selectedSection
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections/${selectedSection}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newContent.title,
          description: newContent.content,
          contentType: 'text'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add content');
      }
      
      const newContentData = await response.json();
      console.log('Server response:', newContentData);
      
      setProfile(prev => {
        const updatedProfile = {
          ...prev,
          profileSections: prev.profileSections.map(section => 
            section.id === selectedSection
              ? { 
                  ...section, 
                  content: [...(section.content || []), {
                    ...newContentData,
                    title: newContent.title,
                    description: newContent.content
                  }]
                }
              : section
          )
        };
        console.log('Updated profile:', updatedProfile);
        return updatedProfile;
      });
      
      setContentDialog(false);
      setNewContent({ type: 'text', title: '', content: '' });
      setSelectedSection(null);
      setError(null);

      await fetchProfile();
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
        profileSections: prev.profileSections.map(section =>
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

  const handleGenerateAIStory = async () => {
    try {
      setIsGeneratingStory(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch test results and generate story
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/generate-story`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI story');
      }

      const data = await response.json();
      
      // Create a new section with the AI story
      const storyResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'AI Personality Analysis',
          type: 'ai_analysis',
          content: [{
            title: 'Your Personality Story',
            description: data.story,
            contentType: 'text'
          }]
        })
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to save AI story');
      }

      // Refresh profile to show new section
      await fetchProfile();
      setError(null);
    } catch (error) {
      console.error('Error generating AI story:', error);
      setError(error.message);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const renderSectionContent = (item, section) => {
    console.log('Rendering content item:', item);
    const isContentExpanded = expandedContent === item.id;

    return (
      <Accordion
        key={item.id}
        expanded={isContentExpanded}
        onChange={() => setExpandedContent(isContentExpanded ? null : item.id)}
        sx={{
          backgroundColor: 'background.default',
          '&:before': {
            display: 'none',
          },
          boxShadow: 1,
          '& .MuiAccordionSummary-root': {
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px',
            }
          },
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
            '&.Mui-expanded': {
              margin: '12px 0'
            }
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: isContentExpanded ? 1 : 0,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            pr: 2
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {item.title}
            </Typography>
            {isOwnProfile && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContent(section.id, item.id, e);
                }}
                color="error"
                sx={{ 
                  ml: 1,
                  visibility: isContentExpanded ? 'visible' : 'hidden'
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {item.description || item.content || ''}
          </Typography>
        </AccordionDetails>
      </Accordion>
    );
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isOwnProfile && (
              <>
                <Button
                  variant="contained"
                  startIcon={<PsychologyIcon />}
                  onClick={handleGenerateAIStory}
                  disabled={isGeneratingStory}
                >
                  {isGeneratingStory ? 'Generating Story...' : 'Generate AI Story'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSection}
                  disabled={profile?.profileSections?.length >= (profile?.sectionLimits?.maxMainSections || 10)}
                  title={profile?.profileSections?.length >= (profile?.sectionLimits?.maxMainSections || 10) ? 'Maximum number of sections reached' : 'Add new section'}
                >
                  Add Section
                </Button>
              </>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {profile?.profileSections?.map((section) => (
            <Accordion
              key={section.id}
              expanded={expandedSection === section.id}
              onChange={() => handleSectionExpand(section.id)}
              sx={{
                backgroundColor: 'background.paper',
                '&:before': {
                  display: 'none',
                },
                boxShadow: 2,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderBottom: expandedSection === section.id ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 2
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {section.title}
                  </Typography>
                  {isOwnProfile && (
                    <Box sx={{ 
                      display: 'flex',
                      gap: 1,
                      visibility: expandedSection === section.id ? 'visible' : 'hidden'
                    }}>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddContent(section.id);
                        }}
                        size="small"
                        variant="outlined"
                      >
                        Add Text
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id, e);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <Box sx={{ pl: 2 }}>
                  {section.content?.map((item) => renderSectionContent(item, section))}
                  {(!section.content || section.content.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No content yet. {isOwnProfile ? 'Click "Add Text" to add some content.' : ''}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Add Section Dialog */}
        <Dialog 
          open={newSectionDialog} 
          onClose={() => {
            setNewSectionDialog(false);
            setError(null);
          }}
          fullWidth
          maxWidth="sm"
        >
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
              sx={{ mt: 2 }}
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
        <Dialog 
          open={contentDialog} 
          onClose={() => {
            setContentDialog(false);
            setError(null);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add Text</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              error={!!error && error.includes('title')}
              helperText={error && error.includes('title') ? error : ''}
              sx={{ mb: 2 }}
            />
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