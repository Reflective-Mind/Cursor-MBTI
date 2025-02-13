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
} from '@mui/material';
import {
  Home as HomeIcon,
  Psychology as PsychologyIcon,
  Insights as InsightsIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Assessment', path: '/assessment', icon: <PsychologyIcon /> },
    { text: 'Insights', path: '/insights', icon: <InsightsIcon /> },
    { text: 'Chat', path: '/chat', icon: <ChatIcon /> },
    { text: 'Community', path: '/community', icon: <PeopleIcon /> },
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ];

  return (
    <AppBar position="static">
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
            }}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 