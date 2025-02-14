import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Psychology as AssessmentIcon,
  Insights as InsightsIcon,
  Chat as ChatIcon,
  Group as CommunityIcon,
  Person as ProfileIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Home', path: '/', icon: <HomeIcon /> },
    { title: 'Assessment', path: '/assessment', icon: <AssessmentIcon /> },
    { title: 'Insights', path: '/insights', icon: <InsightsIcon /> },
    { title: 'AI Chat', path: '/chat', icon: <ChatIcon /> },
    { title: 'Community', path: '/community', icon: <CommunityIcon /> },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      {user && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar
            src={user.avatar}
            sx={{ 
              width: 64, 
              height: 64, 
              margin: '0 auto',
              mb: 1,
              cursor: 'pointer'
            }}
            onClick={() => handleNavigation('/profile')}
          >
            {user.username?.[0]}
          </Avatar>
          <Typography variant="subtitle1">{user.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.mbtiType}
          </Typography>
        </Box>
      )}
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={isCurrentPath(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {user ? (
          <>
            <ListItem button onClick={() => handleNavigation('/profile')}>
              <ListItemIcon><ProfileIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => handleNavigation('/login')}>
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontSize: '1.1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {menuItems.find(item => isCurrentPath(item.path))?.title || 'MBTI Insights'}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
                MBTI Insights
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderBottom: isCurrentPath(item.path) ? 2 : 0,
                      borderRadius: 0,
                      px: 2
                    }}
                    startIcon={item.icon}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </>
          )}
          
          {user ? (
            <Box>
              <IconButton
                onClick={handleMenuClick}
                sx={{ padding: 0.5 }}
              >
                <Avatar
                  src={user.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.username?.[0]}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" />
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
            </Box>
          ) : (
            <Button
              color="inherit"
              onClick={() => handleNavigation('/login')}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 