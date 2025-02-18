import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Psychology as PsychologyIcon,
  Insights as InsightsIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Assessment', path: '/assessment', icon: <PsychologyIcon /> },
    { text: 'Insights', path: '/insights', icon: <InsightsIcon /> },
    { text: 'Chat', path: '/chat', icon: <ChatIcon /> },
    { text: 'Community', path: '/community', icon: <PeopleIcon /> },
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ];

  return (
    <AppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <PsychologyIcon sx={{ mr: 1 }} />
            MBTI Insights
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                sx={{ ml: 2 }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          {user && (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {user.roles?.includes('admin') && (
                  <Tooltip title="Admin Dashboard">
                    <IconButton 
                      color="inherit" 
                      onClick={() => navigate('/admin')}
                      sx={{ color: '#FFD700' }}
                    >
                      <AdminIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Avatar
                  src={user.avatar}
                  alt={user.username}
                  onClick={() => navigate('/profile')}
                  sx={{
                    cursor: 'pointer',
                    border: user.roles?.includes('admin') ? '2px solid #FFD700' : 'none',
                    boxShadow: user.roles?.includes('admin') ? '0 0 10px #FFD700' : 'none'
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: user.roles?.includes('admin') ? '#FFD700' : 'inherit',
                    fontWeight: user.roles?.includes('admin') ? 'bold' : 'normal',
                    textShadow: user.roles?.includes('admin') ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none'
                  }}
                >
                  {user.username}
                  {user.roles?.includes('admin') && ' (Admin)'}
                </Typography>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 