import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Drawer,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  People as RelationshipsIcon,
  TrendingUp as GrowthIcon,
  Work as CareerIcon,
  School as LearningIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const InsightCard = ({ title, icon, description }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        borderRadius: isMobile ? 0 : 1,
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            gap: 1,
          }}
        >
          {icon}
          <Typography variant={isMobile ? "h6" : "h5"} component="h2">
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.9rem' : '1rem',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Insights = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentSection, setCurrentSection] = useState('relationships');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const sections = [
    {
      id: 'relationships',
      title: 'Relationships',
      icon: <RelationshipsIcon />,
      content: 'Your relationship insights will be displayed here...'
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      icon: <GrowthIcon />,
      content: 'Your growth opportunities will be displayed here...'
    },
    {
      id: 'career',
      title: 'Career Path',
      icon: <CareerIcon />,
      content: 'Your career insights will be displayed here...'
    },
    {
      id: 'learning',
      title: 'Learning Style',
      icon: <LearningIcon />,
      content: 'Your learning style insights will be displayed here...'
    }
  ];

  const currentSectionIndex = sections.findIndex(s => s.id === currentSection);

  const handleNext = () => {
    const nextIndex = (currentSectionIndex + 1) % sections.length;
    setCurrentSection(sections[nextIndex].id);
  };

  const handlePrev = () => {
    const prevIndex = currentSectionIndex === 0 ? sections.length - 1 : currentSectionIndex - 1;
    setCurrentSection(sections[prevIndex].id);
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const currentSectionData = sections.find(s => s.id === currentSection);

  return (
    <Container maxWidth="lg" sx={{ 
      py: 2,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      mt: isMobile ? '56px' : 0 // Add top margin on mobile to account for fixed navbar
    }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton 
            color="primary" 
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
            {currentSectionData.title}
          </Typography>
          <IconButton
            color="primary"
            onClick={handleChatClick}
            sx={{ ml: 1 }}
          >
            <ChatIcon />
          </IconButton>
        </Box>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Personality Insights
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Discover deeper insights about your personality type
          </Typography>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: 2,
        overflow: isMobile ? 'auto' : 'visible' // Enable scrolling on mobile
      }}>
        {/* Desktop Navigation */}
        {!isMobile && (
          <Paper sx={{ width: 240, p: 2 }}>
            <List>
              {sections.map((section) => (
                <ListItem
                  key={section.id}
                  button
                  selected={currentSection === section.id}
                  onClick={() => setCurrentSection(section.id)}
                >
                  <ListItemIcon>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.title} />
                </ListItem>
              ))}
              <Divider sx={{ my: 2 }} />
              <ListItem button onClick={handleChatClick}>
                <ListItemIcon><ChatIcon /></ListItemIcon>
                <ListItemText primary="Ask AI Assistant" />
              </ListItem>
            </List>
          </Paper>
        )}

        {/* Content Area */}
        <Paper sx={{ 
          flex: 1, 
          p: 3, 
          position: 'relative',
          overflowY: isMobile ? 'auto' : 'visible', // Enable scrolling on mobile
          maxHeight: isMobile ? 'calc(100vh - 180px)' : 'none' // Limit height on mobile
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            gap: 2
          }}>
            {!isMobile && (
              <Typography variant="h4" gutterBottom>
                {currentSectionData.title}
              </Typography>
            )}
            <Typography>{currentSectionData.content}</Typography>

            {/* Mobile Navigation Arrows */}
            {isMobile && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 'auto',
                pt: 2,
                position: 'sticky',
                bottom: 0,
                backgroundColor: theme.palette.background.paper,
                zIndex: 1
              }}>
                <IconButton onClick={handlePrev} color="primary">
                  <PrevIcon />
                </IconButton>
                <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                  {currentSectionIndex + 1} / {sections.length}
                </Typography>
                <IconButton onClick={handleNext} color="primary">
                  <NextIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem>
              <Typography variant="h6">Sections</Typography>
            </ListItem>
            <Divider />
            {sections.map((section) => (
              <ListItem
                key={section.id}
                button
                selected={currentSection === section.id}
                onClick={() => {
                  setCurrentSection(section.id);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Container>
  );
};

export default Insights; 