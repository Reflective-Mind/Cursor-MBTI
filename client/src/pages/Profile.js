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
    type: 'text',
    content: ''
  });

  const isOwnProfile = !userId || (currentUser && userId === currentUser._id);

  // Fetch profile data
  useEffect(() => {
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

    if (!authLoading) {
      fetchProfile();
    }
  }, [userId, authLoading, navigate, location.pathname]);

  const handleSectionExpand = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleAddSection = () => {
    setNewSectionDialog(true);
  };

  const handleSaveNewSection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${profile._id}/sections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSection)
      });

      if (!response.ok) throw new Error('Failed to add section');
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setNewSectionDialog(false);
      setNewSection({ title: '', type: 'text', content: '' });
    } catch (error) {
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

  const handleDeleteSection = async (sectionId) => {
    try {
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

      if (!response.ok) throw new Error('Failed to delete section');
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      setError(error.message);
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
              <Typography variant="h4">{profile.username}</Typography>
              <Chip label={profile.mbtiType} color="primary" />
            </Box>
          </Box>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSection}
            >
              Add Section
            </Button>
          )}
        </Box>

        {/* Sections */}
        {profile.sections?.map((section) => (
          <Accordion
            key={section.id}
            expanded={expandedSection === section.id}
            onChange={() => handleSectionExpand(section.id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'action.hover',
                  '& .edit-buttons': { opacity: 1 }
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%'
              }}>
                {editingSection === section.id ? (
                  <TextField
                    value={section.title}
                    onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                    variant="standard"
                    fullWidth
                    sx={{ mr: 2 }}
                  />
                ) : (
                  <Typography variant="h6">{section.title}</Typography>
                )}
                {isOwnProfile && (
                  <Box className="edit-buttons" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                    <IconButton size="small" onClick={() => handleEditSection(section.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteSection(section.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {section.type === 'text' && (
                <TextField
                  value={section.content}
                  onChange={(e) => handleUpdateSection(section.id, { content: e.target.value })}
                  multiline
                  fullWidth
                  disabled={!isOwnProfile || editingSection !== section.id}
                />
              )}
              {/* Add more section types here */}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

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
          />
          <TextField
            select
            margin="dense"
            label="Section Type"
            fullWidth
            value={newSection.type}
            onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="list">List</MenuItem>
            <MenuItem value="links">Links</MenuItem>
            <MenuItem value="achievements">Achievements</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSectionDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNewSection} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 