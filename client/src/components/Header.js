import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon, Button, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AvatarWithPreview from './AvatarWithPreview';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import {
  Home as HomeIcon,
  Psychology as PsychologyIcon,
  Insights as InsightsIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Assessment', path: '/assessment', icon: <PsychologyIcon /> },
    { text: 'Insights', path: '/insights', icon: <InsightsIcon /> },
    { text: 'Chat', path: '/chat', icon: <ChatIcon /> },
    { text: 'Community', path: '/community', icon: <PeopleIcon /> },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    } else {
      navigate('/profile');
    }
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ 
          flexGrow: 0, 
          textDecoration: 'none', 
          color: 'inherit',
          mr: 4
        }}>
          MBTI Community
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {navItems.map((item) => (
            <Button
              key={item.text}
              component={RouterLink}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              sx={{ mx: 1 }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {user ? (
          <>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <AvatarWithPreview
                src={user.avatar ? `${process.env.REACT_APP_API_URL}/uploads/avatars/${user.avatar}` : undefined}
                alt={user.username}
                size="small"
                isGold={user.email === 'eideken@hotmail.com'}
              >
                {user.username?.[0]}
              </AvatarWithPreview>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {user?.roles?.includes('admin') && (
                <MenuItem onClick={() => navigate('/admin')}>
                  <ListItemIcon>
                    <AdminIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 